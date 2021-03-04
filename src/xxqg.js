// ==UserScript==
// @name         XXQG Addon
// @namespace    http://tampermonkey.net/
// @version      2021.0222
// @include       https://*xuexi.cn*
// @grant        none
// @run-at       document-start
// ==/UserScript==
const $ = document.querySelectorAll.bind(document);

(function hijack() {
    const oldDocFunc = document.addEventListener.bind(document)
    document.addEventListener = function () {
        if (arguments[0].toLowerCase().indexOf('visibilitychange') >= 0) {
            console.log('hijack visibilitychange')
            return
        }
        return oldDocFunc(...arguments)
    };

    const oldWinFunc = window.addEventListener.bind(window)
    window.addEventListener = function () {
        if (arguments[0].toLowerCase().indexOf('focus') >= 0 || arguments[0].toLowerCase().indexOf('blur') >= 0) {
            console.log('hijack focus and blur')
            return
        }
        return oldWinFunc(...arguments)
    };
})()

function poll(cond, timeout = Infinity, interval = 100) {
    let timeElapsed = 0

    return new Promise((resolve, reject) => {
        function _poll() {
            if (timeElapsed > timeout) {
                reject()
                return
            }
            timeElapsed += interval
            if (cond()) {
                resolve()
                return
            }
            setTimeout(_poll, interval)
        }
        setTimeout(_poll, interval)
    })
}

function sleep(interval) {
    return new Promise(resolve => {
        setTimeout(resolve, interval)
    })
}

function documentLoaded() {
    return new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, false);
        window.addEventListener('load', resolve, false);

    })
}

class EventEmitter {
    constructor() {
        this._callbacks = {}
    }
    on(name, cb) {
        this._callbacks[name] = (this._callbacks[name] || []).concat(cb)
    }
    once(name, cb) {
        const wrapper = (...args) => {
            cb(...args)
            delete this._callbacks[name]
        }
        if (this._callbacks[name] && this._callbacks[name].length) { throw new Error('not empty: ' + name) }
        this.on(name, wrapper)
    }
    fire(name, ...args) {
        (this._callbacks[name] || []).forEach(cb => cb(...args))
    }
}

function randString() {
    return Math.random().toString().slice(2, 12)
}

class Comm {
    constructor() {
        this.events = new EventEmitter()
        this.origins = ['https://pc.xuexi.cn', 'https://www.xuexi.cn']
        this.querying = false

        window.addEventListener('message', e => {
            const payload = JSON.parse(e.data)
            this.events.fire(payload.name, payload, e)
        })
    }
    _send(payload, target) {
        payload = JSON.stringify(payload)
        for (const origin of this.origins) {
            try {
                target.postMessage(payload, origin)
            } catch (e) { console.warn(e) }
        }
    }
    query(name, data, targets, singleAns = true) {
        self.querying = true
        const promises = Array.from(targets).map((target, idx) => {
            const id = name + randString() + idx
            const payload = { id, name, data }
            const result = new Promise(resolve => {
                this.events.once(id, payload => {
                    resolve(payload.data)
                })
            })
            this._send(payload, target)
            return result
        })

        let result
        if (promises.length === 1) {
            result = promises[0]
        } else if (singleAns) {
            result = Promise.all(promises).then(replies => {
                for (const reply of replies) {
                    if (reply !== null) return reply
                }
            })
        } else {
            result = Promise.all(promises)
        }
        return result.finally(() => self.querying = false)
    }
    listen(name, cb) {
        this.events.on(name, (payload, e) => {
            const reply = (answer) => {
                this._send({ name: payload.id, data: answer }, e.source)
            }
            cb(payload.data, reply)
        })
        return this
    }
}
const comm = new Comm()
function allChildWindows() {
    return Array.from($('iframe')).map(x => x.contentWindow)
}

class Status {
    constructor() {
        this.get()
    }
    get() {
        return this.value = !!localStorage.getItem('status')
    }
    async set(value) {
        this.value = value
        localStorage.setItem('status', value ? 'True' : '')
        await comm.query('set-status', value, allChildWindows())
    }
}
const status = new Status()

const router = {
    async reload() {
        await poll(() => !comm.querying)
        location.reload()
    },
    async go(url) {
        if (url === location.url) return
        await poll(() => !comm.querying)
        location.href = url
        await sleep(100)
    },
}
comm.listen('get-menus', async (_, reply) => {
    await poll(() => $("div.content").length > 0)
    let menus = {}
    let found = false
    document.querySelectorAll('a').forEach(e => {
        const text = e.innerHTML.trim()
        menus[e.innerHTML.trim()] = e.href
        if (text === '学习理论') found = true
    })
    reply(found ? menus : null)
}).listen('set-status', async (value, reply) => {
    await status.set(value)
    reply(null)
})

const UI = {
    menus: {},
    async getMenus() {
        try {

            await poll(() => /ICP备案|layout-footer|iframe_wrap/.test(document.body.innerHTML), 10000)
        } catch (e) {
            await router.reload()
        }
        await sleep(300)
        const $menu = $("#root .menu")
        let menus = {}
        if (!$menu.length) {
            await poll(() => $('iframe').length >= 2)
            menus = await comm.query('get-menus', null, allChildWindows())
        } else {
            $menu[0].querySelectorAll('a').forEach(e => {
                const text = e.innerHTML.trim()
                menus[e.innerHTML.trim()] = e.href
            })
        }
        return this.menus = menus
    },
    async readProgress() {
        let results = {}
        let count = 0
        while (!count) {
            $('.my-points-card-text').forEach((ele, i) => {
                ele.innerHTML.replace(/(.*?)(\d+).*\/(.*?)(\d+).*/g, (_, __, x, ___, y) => {
                    results[i] = [parseInt(x), parseInt(y)]
                });
                count++
            })
            if (!count) await sleep(500)
        }
        return results
    },
    async gotoAList(text) {
        const target = this.menus[text]
        if (target) await router.go(target)
    },
    async gotoPoints() {
        await router.go('https://pc.xuexi.cn/points/my-points.html')
    },
    async autoRead(seconds) {
        const begin = Date.now()
        let x = 0
        while (true) {
            if (Date.now() - begin > seconds * 1000) {
                UI.gotoPoints()
                return
            }
            window.scrollTo(0, (x / seconds) * (document.body.scrollHeight - 1000))
            await sleep(1000)
            x += 1
        }
    },
    async selectVideo() {
        await sleep(2000)

        let id = 0
        const t = parseInt(4 * Math.random())
        for (const ele of $('div.tab-item')) {
            if (/重要活动视频专辑|学习专题报道|学习新视界|十九大报告视频|新闻联播/g.test(ele.innerHTML)) {
                if (id === t) {
                    ele.click();
                    await sleep(2000)
                    $('span.list')[0].click();

                }
                id++
            }
        }

        let items = $('.text-link-item-title')
        window.open = url => { location.href = url };
        id = parseInt(Math.random() * (items.length - 1))
        items[id].childNodes[0].click()
    },
    selectArticle() {
        let items = $('.text-link-item-title')
        window.open = url => { location.href = url }
        let id = parseInt(Math.random() * (items.length - 1))
        items[id].childNodes[0].click()
    },
    monitorVideo() {
        let failures = 0
        setInterval(() => {
            const videos = $('video')

            if (!videos.length) return
            if (failures > 5) UI.gotoPoints()
            if (videos[0].paused) {
                failures++
                videos[0].setAttribute("muted", "muted")
                videos[0].click()
                videos[0].play()
            }
        }, 1000)
    }
}

function newButton() {
    let text, func
    if (status.value) {
        text = '停止刷分'
        func = async () => {
            await status.set(false)
            await router.reload()
        }
    } else {
        text = '开始刷分'
        func = async () => {
            await status.set(true)
            await UI.gotoPoints()
        }
    }

    let btn = document.createElement('button')
    btn.innerHTML = text
    btn.id = 'shuafen'
    document.body.appendChild(btn)
    btn.style = 'z-index: 999999; position: fixed; left: 0; top: 0;'
    btn.addEventListener('click', func)
    return btn
}

async function main() {
    await documentLoaded()
    if (window != window.top) return
    await UI.getMenus()

    newButton()
    if (!status.value) return

    const title = document.title
    if (document.body.innerHTML.indexOf('赚取积分') >= 0) {
        const progress = await UI.readProgress()
        if (progress[1][0] < progress[1][1]) {
            UI.gotoAList('学习理论')
            return
        }
        if (progress[2][0] < progress[2][1] || progress[3][0] < progress[3][1]) {
            UI.gotoAList('学习电视台')
            return
        }
        await status.set(false)
        await router.reload()
        return
    }

    if (/lgpage\/detail/.test(location.href) || $('video').length) {
        UI.monitorVideo()
        await UI.autoRead(250)
        return
    }

    if (/<span.*?>学习理论<\/span>/.test(document.body.innerHTML)) {
        await UI.selectArticle()
        return
    }

    if (/<p.*?>学习电视台<\/p>/.test(document.body.innerHTML)) {
        await sleep(2000)
        $('span.text').forEach(e => {
            if (e.innerHTML.indexOf('第一频道') >= 0) {
                window.open = x => { location.href = x }
                e.removeAttribute('_target')
                e.click()
            }
        })
        return
    }
    if (/<span.*?>学习电视台片库<\/span>/.test(document.body.innerHTML)) {
        await UI.selectVideo()
        return
    }

    if (location.href.indexOf('login') >= 0) return
    await UI.gotoPoints()
}
main()
