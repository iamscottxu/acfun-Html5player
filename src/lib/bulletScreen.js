import * as openBSE from 'openbse'
import Cookies from 'js-cookie'
import { Event } from './event'
import { Helper } from './helper'
import { ACWebSocketClient } from './acWebSocketClient'
import { Resources } from './resources'

class BulletScreen {
    /**
     * 
     * @param {Element} bulletElement 
     * @param {Element} videoElement 
     */
    constructor(bulletElement, videoElement) {
        let _event = new Event();
        let _loaded = 0;
        let _bulletScreenCount = 0;
        let _bulletScreenList = [];
        let _videoId = null;
        let _userId = Cookies.get('auth_key');

        _event.add('loadsuccess');
        _event.add('loaderror');
        _event.add('error');
        _event.add('bulletscreencountchanged');
        _event.add('addbulletscreens');
        _event.add('destroy');

        _event.add('acwebsocketstatuschanged');
        _event.add('onlineuserscountchanged');

        this.bind = _event.bind;
        this.unbind = _event.unbind;

        let bulletScreenEngine = new openBSE.BulletScreenEngine(bulletElement, {
            defaultStyle: {
                fontFamily: 'Microsoft YaHei UI, Microsoft YaHei, SimHei, Heiti SC, sans-serif',
                borderColor: 'rgba(0,0,0,0.4)'
            },
            clock: () => videoElement.currentTime * 1000
        }, 'canvas');

        let _acWebSocketClient = new ACWebSocketClient(_userId, Cookies.get('auth_key_ac_sha1'), Cookies.get('_did'));

        _acWebSocketClient.bind('statuschanged', (e) => {
            _event.trigger('acwebsocketstatuschanged', e);
        });
        _acWebSocketClient.bind('onlineuserscountchanged', (e) => {
            _event.trigger('onlineuserscountchanged', e);
        });
        _acWebSocketClient.bind('newbulletscreenreceived', (e) => {
            if (e.bulletScreenData.user === _userId) return;
            let speed = 0.10 + e.bulletScreenData.message.length / 200; //弹幕越长，速度越快
            let bulletScreen = {
                uuid: e.bulletScreenData.commentid, //uuid
                userid: e.bulletScreenData.user, //用户编号
                text: e.bulletScreenData.message, //文本
                type: getBulletScreenType(e.bulletScreenData.mode), //类型
                startTime: parseFloat(e.bulletScreenData.stime) * 1000, //开始时间
                style: {
                    speed: speed, //速度
                    color: `#${Helper.pad(parseInt(e.bulletScreenData.color, 10), 6, 16)}`, //颜色
                    size: parseInt(e.bulletScreenData.size, 10), //字号
                }
            }
            _bulletScreenList.unshift(bulletScreen);
            if (bulletScreen.startTime >= videoElement.currentTime * 1000 && e.bulletScreenData.user != _userId) //当前弹幕开始时间小于加载开始时间
                bulletScreenEngine.addBulletScreen(bulletScreen);
            _bulletScreenCount[2]++;
            triggerbulletScreenCountChangedEvent();
            triggerAddBulletScreens([bulletScreen]);
        });
        _acWebSocketClient.bind('loaderror', (e) => {
            _event.trigger('loaderror', e);
        });
        _acWebSocketClient.bind('error', (e) => {
            _event.trigger('error', e);
        });
        videoElement.addEventListener('playing', () => {
            if (_loaded != 1) return;
            bulletScreenEngine.play();
        });
        videoElement.addEventListener('waiting', () => {
            if (_loaded != 1) return;
            bulletScreenEngine.pause();
        });
        videoElement.addEventListener('pause', () => {
            if (_loaded != 1) return;
            bulletScreenEngine.pause();
        });
        videoElement.addEventListener('ended', () => {
            if (_loaded != 1) return;
            bulletScreenEngine.stop();
            addBulletScreenList();
        });
        videoElement.addEventListener('seeking', () => {
            if (_loaded != 1) return;
            bulletScreenEngine.cleanScreen();
            bulletScreenEngine.pause();
        });
        videoElement.addEventListener('seeked', () => {
            if (_loaded != 1) return;
            addBulletScreenList(videoElement.currentTime * 1000);
            if (!videoElement.paused) bulletScreenEngine.play();
        });
        videoElement.addEventListener('ratechange', () => {
            bulletScreenEngine.setOptions({
                playSpeed: videoElement.playbackRate
            });
        });

        /**
         * 加载弹幕
         * @param {string} videoId - 视频编号
         */
        this.load = (videoId, duration) => {
            if (_loaded === 1) throw new Error();
            function loadBulletScreen(success, error) {
                //弹幕服务器认证
                $.ajax({
                    type: 'GET',
                    url: `http://danmu.aixifan.com/auth/${videoId}`,
                    success: (result) => {
                        //获取弹幕总数
                        $.ajax({
                            type: 'GET',
                            url: `http://danmu.aixifan.com/size/${videoId}`,
                            success: (result) => {
                                _bulletScreenCount = result;
                                triggerbulletScreenCountChangedEvent();
                                //加载弹幕
                                $.ajax({
                                    type: 'GET',
                                    url: `http://danmu.aixifan.com/V4/${videoId}/4073558400000/2000?order=-1`,
                                    dataType: "json",
                                    success: function (result) {
                                        for (let resultItem of result[2]) {
                                            loadBulletScreenFromResultItem(resultItem);
                                        }
                                        triggerAddBulletScreens(_bulletScreenList);
                                        addBulletScreenList();
                                        success();
                                    },
                                    error: error
                                });
                            },
                            error: error
                        });
                    },
                    error: error
                });
            }
            loadBulletScreen(() => {
                _loaded = 1;
                _videoId = videoId;
                _event.trigger('loadsuccess', {});
            }, () => {
                triggerLoaderrorEvent('REQUEST_BULLETSCREEN_FAILED');
            });
        }

        this.connect = (duration) => _acWebSocketClient.connect(_videoId, duration);

        this.getVisibility = bulletScreenEngine.getVisibility;

        this.getOpacity = () => bulletScreenEngine.getOptions().opacity;
        this.setOpacity = (opacity) => bulletScreenEngine.setOptions({ opacity: opacity });

        this.hide = bulletScreenEngine.hide;

        this.show = bulletScreenEngine.show;

        /**
         * 卸载弹幕
         */
        this.destroy = () => {
            if (_loaded != 1) throw new Error();
            _loaded = 0;
            _videoId = null;
            bulletScreenEngine.stop();
            _acWebSocketClient.close();
            _bulletScreenList = [];
            _event.trigger('destroy', {});
        }

        /**
         * 获取加载状态
         */
        this.getLoadedState = () => _loaded;

        /**
         * 获取弹幕总数
         */
        this.getBulletScreenCount = () => _bulletScreenCount;

        /**
         * 获取弹幕列表
         */
        this.getBulletScreenList = () => _bulletScreenList;

        /**
         * 获取隐藏弹幕类型
         */
        this.getHiddenTypes = () => bulletScreenEngine.getOptions().hiddenTypes;

        /**
         * 设置隐藏弹幕类型
         */
        this.setHiddenTypes = (hiddenTypes) => bulletScreenEngine.setOptions({
            hiddenTypes: hiddenTypes
        });

        /**
         * 清空屏幕弹幕
         */
        this.cleanScreen = () => bulletScreenEngine.cleanScreen();

        this.sendbulletScreen = (startTime, typeName, color, text, size) => {
            let type = openBSE.BulletScreenType[typeName];
            let speed = 0.10 + text.length / 200; //弹幕越长，速度越快
            let _startTime = startTime * 1000;
            bulletScreenEngine.addBulletScreen({
                text: text, //文本
                type: type, //类型
                startTime: _startTime, //开始时间
                layer: 1,
                canDiscard: false,
                style: {
                    speed: speed, //速度
                    color: color, //颜色
                    size: size, //字号
                    boxColor: '#6EFFFE' //边框颜色
                }
            });
            _acWebSocketClient.sendbulletScreen(
                startTime, getBulletScreenMode(type),
                new Date().getTime(), parseInt(color.substring(1, color.length - 2), 16),
                text, size
            )
            triggerbulletScreenCountChangedEvent();
            triggerAddBulletScreens([{
                text: text, //文本
                type: type, //类型
                userid: _userId, //用户编号
                startTime: _startTime, //开始时间
                style: {
                    speed: speed, //速度
                    color: color, //颜色
                    size: size, //字号
                }
            }]);
        }

        /**
         * 从请求结果加载弹幕列表
         * @param {object} resultItem - 请求返回的结果
         */
        function loadBulletScreenFromResultItem(resultItem) {
            //传输格式：开始时间（相对于视频,秒）,颜色（16进制RGB值的十进制表示）,
            //类型,字号（像素）,发送用户的编号,发送日期,弹幕编号（早期视频为编号，新视频为UUID）
            let info = resultItem.c.split(',');
            let text = resultItem.m;
            let speed = 0.10 + resultItem.m.length / 200; //弹幕越长，速度越快
            if (speed > 0.20) speed = 0.20;
            _bulletScreenList.unshift({
                uuid: info[6], //uuid
                userid: info[4], //用户编号
                text: text, //文本
                type: getBulletScreenType(info[2]), //类型
                startTime: parseFloat(info[0]) * 1000, //开始时间
                style: {
                    speed: speed, //速度
                    color: `#${Helper.pad(parseInt(info[1], 10), 6, 16)}`, //颜色
                    size: parseInt(info[3], 10), //字号
                }
            });
        }

        function getBulletScreenType(mode) {
            switch (parseInt(mode)) {
                case 1:
                    return openBSE.BulletScreenType.rightToLeft; //流弹幕
                case 2:
                    return openBSE.BulletScreenType.leftToRight; //逆向弹幕 猜测
                //case 3:
                //type = openBSE.BulletScreenType.rightToLeft; //游客弹幕 猜测
                //break;
                case 4:
                    return openBSE.BulletScreenType.top; //顶部弹幕
                case 5:
                    return openBSE.BulletScreenType.bottom; //底部弹幕
                default:
                    return openBSE.BulletScreenType.rightToLeft;
            }
        }

        function getBulletScreenMode(type) {
            switch (type) {
                case openBSE.BulletScreenType.rightToLeft:
                    return 1; //流弹幕
                case openBSE.BulletScreenType.leftToRight:
                    return 2; //逆向弹幕 猜测
                case openBSE.BulletScreenType.top:
                    return 4; //顶部弹幕
                case openBSE.BulletScreenType.bottom:
                    return 5; //底部弹幕
                default:
                    return 1;
            }
        }

        /**
         * 添加弹幕到弹幕引擎
         * @param {number} loadStartTime - 开始时间（单位：毫秒）
         */
        function addBulletScreenList(loadStartTime = 0) {
            bulletScreenEngine.cleanBulletScreenList(); //清空弹幕列表
            for (let bulletScreen of _bulletScreenList) {
                if (bulletScreen.startTime < loadStartTime - 1000) continue; //当前弹幕开始时间小于加载开始时间
                bulletScreenEngine.addBulletScreen(bulletScreen);
            }
        }

        function triggerLoaderrorEvent(type) {
            _loaded = -1;
            let fullType = `BULLETSCREENLOAD_${type}`;
            _event.trigger('loaderror', {
                errorType: fullType,
                message: Resources[fullType].toString()
            });
        }

        function triggerbulletScreenCountChangedEvent() {
            _event.trigger('bulletscreencountchanged', { bulletScreenCount: Helper.clone(_bulletScreenCount) });
        }

        function triggerAddBulletScreens(newBulletScreens, cleanOld = false) {
            _event.trigger('addbulletscreens', { newBulletScreens: Helper.clone(newBulletScreens), cleanOld: cleanOld });
        }

        //小窗口播放缩小弹幕
        setInterval(() => {
            if (bulletElement.clientWidth < 300) bulletScreenEngine.setOptions({
                scaling: 0.5
            });
            else bulletScreenEngine.setOptions({
                scaling: 1
            });
        }, 100);
    }
}

export { BulletScreen }