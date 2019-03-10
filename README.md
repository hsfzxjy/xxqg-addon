# XXQG 刷分插件

可以自动刷满网页版支持的 31 分，包括：

 + 每日登录 1 分
 + 阅读文章 6 分
 + 观看视频 6 分
 + 阅读时长 8 分
 + 视频时长 10 分

## 安装

本插件依赖于 TamperMonkey（俗称「油猴」）。

### 安装 TamperMonkey

从 [这里](https://github.com/hsfzxjy/xxqg-addon/raw/master/build/tamper_monkey_4_8_0.crx) 下载 TamperMonkey。

在 Google Chrome 新标签页键入 `chrome://extensions` 打开插件面板。

勾选 Developer Mode / 开发者模式 选项，一般在右上角。

将下载好的 `tamper_monkey_4_8_0.crx` 文件拖入页面中，即可完成油猴的安装。

（更新：如果提示文件损坏，请参考 [Issue 2](/../../issues/2) 中的做法）

### 安装刷分脚本

![](./tm-logo.png)

点击右上角工具栏中的 TamperMonkey 图标，选择 DashBoard/管理面板，切换到 Utilities/实用工具 标签页，在 URL 输入框中键入 https://github.com/hsfzxjy/xxqg-addon/raw/master/build/xxqg.js ，点击导入，即可完成安装。

## 使用

插件安装完毕后，访问学习网站的任意页面左上角都会有 `开始刷分/停止刷分` 按钮，点击即可开始/暂停。

如果未登录网站，插件会引导至登录页面，届时请用 APP 扫码登录。

## 已知问题

 + 每天都需要扫码登录，但登陆后的任务会自动完成，无需人为干预。
 + 插件的原理是用代码模拟人的机械性浏览操作，并无取巧之处。因此待所有任务完成仍需要一定的时间，普通时段约需一个小时，特殊时段可以减半。在此期间请保持网络的通畅。
 + 如果刷分过程意外终止，手动导航至 个人积分页（ https://pc.xuexi.cn/points/my-points.html ）可解决问题。
