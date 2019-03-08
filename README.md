# acfun-Html5player
[![Version 3.6](https://img.shields.io/badge/version-3.6-brightgreen.svg)](https://github.com/iamscottxu/acfun-Html5player/releases)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/oodpfboapdbeeefjdlilcmoohdhnieen.svg)](https://chrome.google.com/webstore/detail/acfun-html5-player/oodpfboapdbeeefjdlilcmoohdhnieen)
[![Firefox Add-ons](https://img.shields.io/amo/stars/acfun-html5player.svg)](https://addons.mozilla.org/zh-CN/firefox/addon/acfun-html5player/)
[![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/iamscottxu/acfun-Html5player/blob/master/LICENSE)

用于AcFun的HTML5播放器。

## 简介
acfun-html5player是一个为AcFun设计的全新Html5第三方播放器。

采用[openBSE](https://iamscottxu.github.io/openBSE/)高性能弹幕引擎，弹幕丝滑般流畅；</br>
支持自动清晰度，根据网络环境自动切换，免去卡顿烦恼；</br>
调整播放速度，鬼畜乐趣无穷；</br>
增加分P切换按钮，换P免刷新，全屏不退出。

暂不支持高级弹幕，更多功能敬请期待。

## 安装和使用
直接进入以下地址，安装浏览器扩展，打开AcFun播放页面即可使用。对于不能访问Chrome网上应用商店或使用其他Chromium内核浏览器（360浏览器、QQ浏览器等绝大多数国产浏览器）的小伙伴可以到[`https://github.com/iamscottxu/acfun-Html5player/releases/`](https://github.com/iamscottxu/acfun-Html5player/releases/)页面单独下载最新版本的crx包并打开Chrome的应用扩展页面进行安装。

* Chrome Web Store [`https://chrome.google.com/webstore/detail/acfun-html5-player/oodpfboapdbeeefjdlilcmoohdhnieen`](https://chrome.google.com/webstore/detail/acfun-html5-player/oodpfboapdbeeefjdlilcmoohdhnieen)

* Firefox Add-ons [`https://addons.mozilla.org/zh-CN/firefox/addon/acfun-html5player/`](https://addons.mozilla.org/zh-CN/firefox/addon/acfun-html5player/)

* Edge 版本插件可手动下载使用，暂未发布（微软Windows商店上架扩展需要提前申请，才能上传，审批时间奇慢无比，目前已经提交申请，但是微软方面没有任何回应）

>### 提示
>#### Chrome浏览器crx扩展包的具体安装方法
>
>[`https://jingyan.baidu.com/article/e4511cf35c2df92b845eafb3.html`](https://jingyan.baidu.com/article/e4511cf35c2df92b845eafb3.html)
>
>下载后crx包后，按照以上页面中的“扩展程序的安装方法一”进行安装。

>### 提示
>#### Edge未上架扩展手动加载方法
>
>鉴于很多小伙伴询问Edge怎么使用扩展，这里说明下：
> * 点击`Clone or download -> Download ZIP`下载；
> * 下载解压缩后，打开Edge浏览器，地址栏输入`about:flags`，在里面勾选`启用开发人员扩展功能（这可能让设备处于危险之中）`选择，关闭页面；
> * 点击`右上角有三个点图标的菜单 -> 扩展 -> 加载扩展`，在打开的窗口中选择`edge\Extension`文件夹，即可使用扩展。
>Ps：Windows 10早期版本并不支持扩展加载，请打开Windows自动更新，并更新到最新版本。
>

## 联系作者
如果有任何问题请写Issus。<br/>
Email：xyc0714@aliyun.com

## 版权说明
这个项目是一个开源项目，遵循MIT开源协议。

## 更新历史
### 3.6(2019-03-08)
* 增加弹幕发送字体、模式、颜色选择功能。

### 3.5(2019-03-07)
* 更新弹幕服务器接口；
* 增加加载动画；
* 恢复一段时间后视频无法加载的问题；
* 优化播放器逻辑。

### 3.4(2019-03-05)
* 恢复实时弹幕解析错误的问题。

### 3.3(2019-03-05)
* 恢复再某些情况下弹幕显示异常的问题；
* 优化弹幕引擎性能；
* 恢复快捷键支持；
* 恢复一些问题。

### 3.2(2019-03-02)
* 增加自动换集功能；
* 恢复番剧、影视区支持。

### 3.1(2019-03-01)
* 重构整个播放器，使用更流畅。

### 2.3(2018-09-30)
* 增加颜文字快捷输入功能；
* 恢复在重复播放时无法正常显示弹幕的问题；
* 恢复在播放结束后拖动进度条后也会从头播放的问题；
* 恢复拖动进度条之后不会清除屏幕上的弹幕的问题；
* 恢复Edge版插件无法切换清晰度的问题。

### 2.2(2018-09-29)
* 增加番剧播放页面的播放支持；
* 恢复新出现的跨域请求被浏览器拦截的问题;
* 恢复画质显示错乱的问题。

### 2.1(2018-09-28)
* 恢复新出现的跨域请求被浏览器拦截的问题。

### 2.0(2018-09-23)
* 此版本新增了对简单弹幕发送的支持。

### 1.1(2018-06-17)
* 修复一些Bug。

### 1.0(2018-06-13)
* 第一个版本。
