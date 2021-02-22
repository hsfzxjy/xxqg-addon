# XXQG 刷分插件

当前版本：2021.0222 ，脚本导入后注意观察油猴面板显示的版本号是不是最新的。

XXQG 官网在 [这里](https://www.xuexi.cn)

可以自动刷满网页版支持的 25 分，包括：

- 每日登录 1 分
- 我要选读文章 12 分
- 视听学习 6 分
- 视听学习时长 6 分

## 安装

本插件依赖于 TamperMonkey（俗称「油猴」）和 Google Chrome。

### 安装 TamperMonkey

从 [这里](https://github.com/hsfzxjy/xxqg-addon/raw/master/build/tamper_monkey_4_8_0.crx) 或 [这里](https://cdn.jsdelivr.net/gh/hsfzxjy/xxqg-addon/build/tamper_monkey_4_8_0.crx) 下载 TamperMonkey。

在 Google Chrome 新标签页键入 `chrome://extensions` 打开插件面板。

勾选 开发者模式（Developer Mode） 选项，一般在右上角。

将下载好的 `tamper_monkey_4_8_0.crx` 文件拖入页面中，即可完成油猴的安装。

（更新：如果提示文件损坏，请参考 [Issue #2](/../../issues/2) 中的做法）

### 安装刷分脚本

![](./tm-logo.png)

点击右上角工具栏中的 TamperMonkey 图标，选择 管理面板（DashBoard），切换到 实用工具（Utilities） 标签页，在 URL 输入框中键入 https://cdn.jsdelivr.net/gh/hsfzxjy/xxqg-addon@2021.0222/src/xxqg.js ，点击导入，即可完成安装。

## 使用

插件安装完毕后，访问学习网站的任意页面左上角都会有 `开始刷分/停止刷分` 按钮，点击即可开始/暂停。

如果未登录网站，插件会引导至登录页面，届时请用 APP 扫码登录。

## 已知问题

- 每天都需要扫码登录，但登陆后的任务会自动完成，无需人为干预。
- 插件的原理是用代码模拟人的机械性浏览操作，并无取巧之处。因此待所有任务完成仍需要一定的时间。在此期间请保持网络的通畅。浏览器页面不必放在前台。
- 如果刷分过程意外终止，手动导航至 个人积分页（ https://pc.xuexi.cn/points/my-points.html ）可解决问题。
