# acfun-Html5player
[![Version 2.3](https://img.shields.io/badge/version-2.3-brightgreen.svg)](https://github.com/iamscottxu/acfun-Html5player/releases)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/oodpfboapdbeeefjdlilcmoohdhnieen.svg)](https://chrome.google.com/webstore/detail/acfun-html5-player/oodpfboapdbeeefjdlilcmoohdhnieen)
[![Firefox Add-ons](https://img.shields.io/amo/stars/acfun-html5player.svg)](https://addons.mozilla.org/zh-CN/firefox/addon/acfun-html5player/)
[![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/iamscottxu/acfun-Html5player/blob/master/LICENSE)

用于AcFun的HTML5播放器。

## 简介
acfun-html5player是一个为AcFun设计的全新Html5第三方播放器，完全按照官方Flash播放器样式设计，完整支持Flash版本的所有快捷键。

暂时只支持简单的弹幕发送，不支持拖动小窗口播放，可以播放普通弹幕。

## 安装和使用
直接进入以下地址，安装浏览器扩展，打开AcFun播放页面即可使用。对于不能访问Chrome网上应用商店或使用其他Chromium内核浏览器（360浏览器、QQ浏览器等绝大多数国产浏览器）的小伙伴可以到[`https://github.com/iamscottxu/acfun-Html5player/releases/`](https://github.com/iamscottxu/acfun-Html5player/releases/)页面单独下载最新版本的crx包并打开Chrome的应用扩展页面进行安装。

* Chrome Web Store [`https://chrome.google.com/webstore/detail/acfun-html5-player/oodpfboapdbeeefjdlilcmoohdhnieen`](https://chrome.google.com/webstore/detail/acfun-html5-player/oodpfboapdbeeefjdlilcmoohdhnieen)

* Firefox Add-ons [`https://addons.mozilla.org/zh-CN/firefox/addon/acfun-html5player/`](https://addons.mozilla.org/zh-CN/firefox/addon/acfun-html5player/)

* Edge 版本插件可手动下载使用，暂未发布

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
> * 点击`右上角有三个点图标的菜单 -> 扩展 -> 加载扩展`，在打开的窗口中选择`edge\Extension`文件夹，即可使用扩展。（Ps：Windows 10早期版本并不支持扩展加载，请更打开Windows自动更新，并更新到最新版本）。
>

## 联系作者
如果有任何问题请写Issus。<br/>
Email：xyc0714@aliyun.com

## 版权说明
这个项目是一个开源项目，遵循MIT开源协议。

## 更新历史
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
