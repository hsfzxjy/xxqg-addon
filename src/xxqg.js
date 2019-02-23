// ==UserScript==
// @name         XXQG Addon
// @namespace    http://tampermonkey.net/
// @version      1.0
// @include       https://*xuexi.cn*
// @grant        none
// @run-at       document-start
// ==/UserScript==

function getMenus () {

    window.addEventListener('message', e => {
        e.data.replace(/^ts(.*)/, (m, s) => localStorage.setItem('status', s))
    })

    let menus = {}
    let flag = false
    document.querySelectorAll('a').forEach(e => {
        const text = e.innerHTML.trim()
        menus[e.innerHTML.trim()] = e.href
        if (text === '学习研究') flag = true
    })
    const status = localStorage.getItem('status') || ''
    menus.status = status
    try {
        if (flag) window.top.postMessage(JSON.stringify(menus), 'https://pc.xuexi.cn')
    } catch (e) {
        console.warn(e)
    }
    try {
        if (flag) window.top.postMessage(JSON.stringify(menus), 'https://www.xuexi.cn')
    } catch (e) {
        console.warn(e)
    }
}

const oldDocFunc = document.addEventListener.bind(document)

document.addEventListener = function () {
    console.log(arguments)
    if (arguments[0].toLowerCase().indexOf('visibilitychange') >= 0) {
        console.log('hacked visibilitychange')
        return
    }
    return oldDocFunc(...arguments)
};

const oldWinFunc = window.addEventListener.bind(window)

window.addEventListener = function () {
    console.log(arguments)
    if (arguments[0].toLowerCase().indexOf('focus') >= 0 || arguments[0].toLowerCase().indexOf('blur') >= 0) {
        console.log('hacked focus and blur')
        return
    }
    return oldWinFunc(...arguments)
};

document.addEventListener('DOMContentLoaded', () => {
    (function($, css, run) {
        'use strict';
        if (window != window.top) {
            getMenus()
            return
        }

        let menus

        function waitMenus () {

            return new Promise(resolve => {
                window.addEventListener('message', e => {
                    menus = JSON.parse(e.data)
                    if (menus.status === undefined) return
                    resolve()
                })
            })
        }

        function newButton (text) {
            var btn = document.createElement('button');
            btn.innerHTML = text;
            btn.id = 'shuafen';
            document.body.appendChild(btn);
            btn.style = 'z-index: 999999; position: fixed; left: 0; top: 0;';
            return btn;
        }

        function readProgress () {
            return new Promise(resolve => {
                let results = {}
                let count = 0
                console.debug($('.my-points-card-text'));
                $('.my-points-card-text').forEach((ele, i) => {
                    ele.innerHTML.replace(/.*(\d+).*\/(.*?)(\d+).*/g, (_, x, __, y) => results[i] = [parseInt(x), parseInt(y)]);
                    count ++
                })
                if (!count) { setTimeout(() => resolve(readProgress()), 500); return}
                console.log(results);
                localStorage.setItem('progress', JSON.stringify(results));
                resolve(results)
            })
        }

        function gotoAList (text) {
            if (!menus[text]) return
            const target = menus[text]
            if (location.href != target)
                location.href = target;
        }

        function gotoPoints () {
            location.href = 'https://pc.xuexi.cn/points/my-points.html'
        }
        // setTimeout(gotoAList, 1000);
        function autoRead (seconds) {
            const begin = Date.now()
            function scroller (x) {
                if (Date.now() - begin > seconds * 1000) {
                    gotoPoints()
                    return
                }
                window.scrollTo(0, (x / seconds) * (document.body.scrollHeight - 1000));
                setTimeout(() => scroller(x + 1), 1000);
            }
            scroller(0);
        }
        //autoRead(10);
        function selectVideo () {
            new Promise(resolve => {
                setTimeout(() => {
                    let id = 0
                    const t = parseInt(3 * Math.random())
                    $('.custom-radio').forEach(ele => {
                        console.log(ele.value);

                        if (/重要活动视频专辑|学习专题报道|学习新视界|十九大报告视频|新闻联播/g.test(ele.value)) {
                            if (id == t) {
                                ele.click();
                                resolve();
                            }
                            id++
                        }
                    });
                }, 2000);
            }).then(() => {
                let items = $('.word-item:first-child')
                window.open = url => { location.href = url };
                let id = parseInt(Math.random() * (items.length - 1));
                items[id].click();
            });
        }

        function selectArticle () {
            new Promise(resolve => {
                resolve()
            }).then(() => {
                let items = $('.word-item:first-child')
                window.open = url => { location.href = url };
                let id = parseInt(Math.random() * (items.length - 1));
                items[id].click();
            });
        }
        // selectItem();

        function toggleStatus (status) {
            localStorage.setItem('status', status)

            if (window == window.top) {
                $('iframe')[0].contentWindow.postMessage('ts' + status, 'https://www.xuexi.cn')
                return new Promise(resolve => {
                    setTimeout(() => resolve(), 500)
                })
            }
        }

        function main () {
            const status = menus.status
            console.log(status)
            let text, func
            if (status) {
                text = '停止刷分';
                func = () => {
                    toggleStatus('').then(() => location.reload())
                }
            } else {
                text = '开始刷分';
                func = () => {
                    toggleStatus('1').then(() => gotoPoints())
                }
            }
            newButton(text).addEventListener('click', func);
            if (!status) return;

            const title = document.title
            if (document.body.innerHTML.indexOf('赚取积分') >= 0) {
                readProgress().then(progress => {
                    console.log(progress);
                    if (progress[1][0] < progress[1][1] || progress[3][0] < progress[3][1]) {
                        gotoAList('学习研究');
                        return
                    }
                    if (progress[2][0] < progress[2][1] || progress[4][0] < progress[4][1]) {
                        gotoAList('学习电视台');
                        return
                    }
                    return
                })
                return
            }

            if (/学习研究\s\|/.test(title)) {
                selectArticle()
                return
            }
            if (document.body.innerHTML.indexOf('打印') >= 0 && document.body.innerHTML.indexOf('编辑') >= 0) {
                autoRead(250)
                return
            }
            if (/学习电视台\s\|/.test(title)) {
                setTimeout(() => {
                    $('a').forEach(e => {
                        if (e.innerHTML.indexOf('第一频道') >= 0) {
                            window.open = x => { location.href = x }
                            e.removeAttribute('_target')
                            e.click()
                        }
                    })
                }, 4000);
                return
            }
            if (/学习电视台片库\s\|/.test(title)) {
                selectVideo()
                return
            }
            if ($('video').length) {
                const begin = Date.now()
                setInterval(() => {
                    const delta = (Date.now() - begin) / 310 / 1000
                    if (delta > 1)
                        gotoPoints()
                    window.scrollTo(0, delta * (document.body.scrollHeight - 1000));
                }, 2000)
                return
            }

            if (location.href.indexOf('login') >= 0) return
            gotoPoints()
        }
        waitMenus().then(main);
        // setTimeout(main, 700);
    })(
        document.querySelectorAll.bind(document),
        text => {
            let style = document.newElement('style');
            style.innerHTML = style;
            document.body.appendChild(style);
            return style;
        }, (sel, func) => {
            document.querySelectorAll(sel).forEach(func);
        });
})
