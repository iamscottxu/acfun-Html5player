import * as openBSE from 'openbse'
import { Event } from './event'
import { Helper } from 'openbse/dist/lib/helper';

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

        _event.add('loadsuccess');
        _event.add('loaderror');
        _event.add('bulletScreenCountChanged');
        _event.add('addBulletScreens');
        _event.add('destroy');

        this.bind = _event.bind;
        this.unbind = _event.unbind;

        let bulletScreenEngine = new openBSE.BulletScreenEngine(bulletElement, {
            defaultStyle: {
                fontFamily: 'Microsoft Yahei UI, Microsoft Yahei, SimHei, Heiti SC, sans-serif',
                borderColor: 'rgba(0,0,0,0.4)'
            },
            clock: () => videoElement.currentTime * 1000
        }, 'css3');

        videoElement.addEventListener('playing', () => {
            if (!_loaded === 1) return;
            bulletScreenEngine.play();
        });
        videoElement.addEventListener('waiting', () => {
            if (!_loaded === 1) return;
            bulletScreenEngine.pause();
        });
        videoElement.addEventListener('pause', () => {
            if (!_loaded === 1) return;
            bulletScreenEngine.pause();
        });
        videoElement.addEventListener('ended', () => {
            if (!_loaded === 1) return;
            bulletScreenEngine.stop();
            addBulletScreenList();
        });
        videoElement.addEventListener('seeking', () => {
            if (!_loaded === 1) return;
            bulletScreenEngine.cleanScreen();
            bulletScreenEngine.pause();
        });
        videoElement.addEventListener('seeked', () => {
            if (!_loaded === 1) return;
            addBulletScreenList(videoElement.currentTime * 1000);
            if(!videoElement.paused) bulletScreenEngine.play();
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
        this.load = (videoId) => {
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
                _event.trigger('loadsuccess', {});
            }, () => {
                triggerLoaderrorEvent('REQUEST_BULLETSCREEN_FAILED');
            });
        }

        this.getVisibility = bulletScreenEngine.getVisibility;

        this.hide = bulletScreenEngine.hide;

        this.show = bulletScreenEngine.show;

        /**
         * 卸载弹幕
         */
        this.destroy = () => {
            if (_loaded != 1) throw new Error();
            _loaded = 0;
            bulletScreenEngine.stop();
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
         * 从请求结果加载弹幕列表
         * @param {object} resultItem - 请求返回的结果
         */
        function loadBulletScreenFromResultItem(resultItem) {
            //传输格式：开始时间（相对于视频,秒）,颜色（16进制RGB值的十进制表示）,
            //类型,字号（像素）,发送用户的编号,发送日期,弹幕编号（早期视频为编号，新视频为UUID）
            let info = resultItem.c.split(',');
            let text = resultItem.m;
            let type = 0;
            let speed = 0.10 + resultItem.m.length / 200; //弹幕越长，速度越快
            if (speed > 0.20) speed = 0.20;
            switch (Number(info[2])) {
                case 1:
                    type = openBSE.BulletScreenType.rightToLeft; //流弹幕
                    break;
                case 2:
                    type = openBSE.BulletScreenType.leftToRight; //逆向弹幕 猜测
                    break;
                //case 3:
                //type = openBSE.BulletScreenType.rightToLeft; //游客弹幕 猜测
                //break;
                case 4:
                    type = openBSE.BulletScreenType.top; //顶部弹幕
                    break;
                case 5:
                    type = openBSE.BulletScreenType.bottom; //底部弹幕
                    break;
                default:
                    type = openBSE.BulletScreenType.rightToLeft;
                    break;
            }
            _bulletScreenList.unshift({
                uuid: info[6], //uuid
                userid: info[4], //用户编号
                text: text, //文本
                type: type, //类型
                startTime: Number(info[0]) * 1000, //开始时间
                style: {
                    speed: speed, //速度
                    color: `#${Number(info[1]).toString(16)}`, //颜色
                    size: Number(info[3]), //字号
                }
            });
        }

        /**
         * 添加弹幕到弹幕引擎
         * @param {number} loadStartTime - 开始时间（单位：毫秒）
         */
        function addBulletScreenList(loadStartTime = 0) {
            bulletScreenEngine.cleanBulletScreenList(); //清空弹幕列表
            for (let bulletScreen of _bulletScreenList) {
                if (bulletScreen.startTime < loadStartTime) continue; //当前弹幕开始时间小于加载开始时间
                bulletScreenEngine.addBulletScreen(bulletScreen);
            }
        }

        function triggerLoaderrorEvent(type) {
            _loaded = -1;
            _event.trigger('loaderror', {
                type: type,
                message: Resources[`BULLETSCREENLOAD_${type}`].toString()
            });
        }

        function triggerbulletScreenCountChangedEvent() {
            _event.trigger('bulletScreenCountChanged', { bulletScreenCount: Helper.clone(_bulletScreenCount) });
        }

        function triggerAddBulletScreens(newBulletScreens, cleanOld = false) {
            _event.trigger('addBulletScreens', { newBulletScreens: Helper.clone(newBulletScreens), cleanOld: cleanOld });
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