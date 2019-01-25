import { Event } from '../event'
import { Resources } from '../resources'
let Hls = require('hls.js');
let $ = require('jquery');

class AcFunVideoAdapter {
    constructor(videoElement) {
        let _hls;
        let _videoData;
        let _loaded = 0;
        let _event = new Event();
        _event.add('loadsuccess');
        _event.add('videoloadsuccess');
        _event.add('loaderror');
        _event.add('destroy');
        _event.add('qualityswitching');
        _event.add('qualityswitched');

        this.bind = _event.bind;
        this.unbind = _event.unbind;

        //解密信息
        let config = {
            ek: {
                a1: 'bf',
                a8: 'f',
                x2: 'Kz0mooZM'
            },
            mk: {
                a3: '1z4i',
                a4: '86rv',
                a5: 'f45',
                k3: 'b7',
                nk: 'm1uN9G6c'
            },
            ctype: '86',
            ev: 4
        }
        function decode64(a) {
            if (!a) return '';
            a = a.toString();
            var b, c, d, e, f, g, h,
                i = new Array(- 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 62, - 1, - 1, - 1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, - 1, - 1, - 1, - 1, - 1, - 1, - 1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, - 1, - 1, - 1, - 1, - 1, - 1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, - 1, - 1, - 1, - 1, - 1);
            for (g = a.length, f = 0, h = ''; f < g;) {
                do {
                    b = i[255 & a.charCodeAt(f++)]
                } while (f < g && - 1 == b);
                if (- 1 == b) break;
                do {
                    c = i[255 & a.charCodeAt(f++)]
                } while (f < g && - 1 == c);
                if (- 1 == c) break;
                h += String.fromCharCode(b << 2 | (48 & c) >> 4);
                do {
                    if (61 == (d = 255 & a.charCodeAt(f++))) return h;
                    d = i[d]
                } while (f < g && - 1 == d);
                if (- 1 == d) break;
                h += String.fromCharCode((15 & c) << 4 | (60 & d) >> 2);
                do {
                    if (61 == (e = 255 & a.charCodeAt(f++))) return h;
                    e = i[e]
                } while (f < g && - 1 == e);
                if (- 1 == e) break;
                h += String.fromCharCode((3 & d) << 6 | e)
            }
            return h
        }
        function jie(a, b) {
            for (var c, d = [
            ], e = 0, f = '', g = 0; g < 256; g++) d[g] = g;
            for (g = 0; g < 256; g++) e = (e + d[g] + a.charCodeAt(g % a.length)) % 256,
                c = d[g],
                d[g] = d[e],
                d[e] = c;
            g = 0,
                e = 0;
            for (var h = 0; h < b.length; h++) g = (g + 1) % 256,
                e = (e + d[g]) % 256,
                c = d[g],
                d[g] = d[e],
                d[e] = c,
                f += String.fromCharCode(b.charCodeAt(h) ^ d[(d[g] + d[e]) % 256]);
            return f
        }

        /**
         * 加载适配器
         * @param {string} videoId - 视频编号
         */
        this.load = (videoId, qualityIndex = -1) => {
            if (_loaded === 1) throw new Error();
            let loadHls = (success) => {
                let hls = new Hls({
                    xhrSetup: (xhr, url) => { xhr.withCredentials = true; }, // 跨域请求，附加 Cookie，否则返回403
                    debug: true
                });
                // bind them together
                hls.attachMedia(videoElement);

                hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
                    _event.trigger('qualityswitching', {qualityIndex: getQualityIndexByHLSQualityIndex(data.level)});
                });

                hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                    _event.trigger('qualityswitched', {qualityIndex: getQualityIndexByHLSQualityIndex(data.level)});
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error(Resources.VIDEOLOAD_HLS_ERROR.fillData({ code: data.details }));
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                // try to recover network error
                                console.warn(Resources.VIDEOLOAD_HLS_NETWORK_ERROR.toString());
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.warn(Resources.VIDEOLOAD_HLS_MEDIA_ERROR.toString());
                                hls.recoverMediaError();
                                break;
                            default:
                                // cannot recover
                                hls.destroy();
                                triggerLoaderrorEvent('HLS_OTHER_ERROR');
                                break;
                        }
                    }
                });
                hls.on(Hls.Events.MEDIA_ATTACHED, () => success(hls));
            }
            let getVideoData = (success, error) => {
                $.ajax({
                    type: 'GET', url: `http://api.aixifan.com/plays/youku/${videoId}`,
                    dataType: 'json',
                    headers: {
                        deviceType: 2
                    },
                    success: function (result) {
                        $.ajax({
                            type: 'GET',
                            url: 'http://player.acfun.cn/js_data',
                            dataType: 'jsonp',
                            data: {
                                sign: result.data.embsig,
                                vid: result.data.sourceId,
                                ct: config.ctype,
                                ev: config.ev
                            },
                            success: function (result) {
                                if (result.encrypt = '1')
                                    result.data = JSON.parse(jie(config.mk.nk + config.ek.x2, decode64(result.data)));
                                success(result.data);
                            },
                            error: error
                        });
                    },
                    error: error
                });
            }
            let loadVideo = (success) => {
                if (qualityIndex >= 0) _hls.loadLevel = _hls.startLevel = getQualityIndexByHLSQualityIndex(qualityIndex);
                //加载视频
                _hls.loadSource(createM3U8ListFile(_videoData.stream));
                _hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                    success();
                });
            }
            loadHls((hls) => {
                _hls = hls;
                getVideoData((videoData) => {
                    _videoData = videoData;
                    console.log(videoData);
                    loadVideo(() => {
                        _loaded = 1;
                        _event.trigger('loadsuccess', {});
                    });
                }, () => {
                    triggerLoaderrorEvent('GET_DATA_FAILED');
                })
            })
        }

        /**
         * 卸载视频
         */
        this.destroy = () => {
            if (_loaded != 1) throw new Error();
            _loaded = 0;
            _hls.destroy();
            _event.trigger('destroy', {});
        }

        //this.getDuration = () => _hls.

        /**
         * 获取当前视频清晰度
         * @returns {number} 视频清晰度索引
         */
        this.getQualityIndex = () => getQualityIndexByHLSQualityIndex(_hls.currentLevel);

        /**
         * 获取是否启用了自动质量选择
         */
        this.getAutoQualityEnabled = () => _hls.autoLevelEnabled;

        /**
         * 获取视频清晰度列表
         * @function
         * @returns {Array} 视频清晰度索引列表（从质量差到质量好排序）
         */
        this.getQualityIndexList = getQualityIndexList;

        /**
         * 切换视频质量
         */
        this.setQualityIndex = (qualityIndex) => {
            _hls.nextLevel = getHLSQualityIndexByQualityIndex(qualityIndex);
        }

        /**
         * 获取加载状态
         */
        this.getLoadedState = () => _loaded;

        /**
         * 创建m3u8文件
         * @param {object} stream - 流信息
         */
        function createM3U8ListFile(stream) {
            let m3u8 = ['#EXTM3U\n#EXT-X-VERSION:4\n'];
            stream.sort((a, b) => parseInt(a.quality) < parseInt(b.quality) ? 1 : parseInt(a.quality) > parseInt(b.quality) ? -1 : 0);
            for (let _stream of stream) {
                if (typeof _stream.m3u8 === 'string')
                    m3u8.push(`#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=${Math.round(_stream.size / _stream.duration * 8)},RESOLUTION=${_stream.width}x${_stream.height}\n${_stream.m3u8}\n`);
            }
            return URL.createObjectURL(new Blob(m3u8, { type: 'application/x-mpegURL' }));
        }

        function triggerLoaderrorEvent(type) {
            _loaded = -1;
            _event.trigger('loaderror', {
                type: type,
                message: Resources[`VIDEOLOAD_${type}`].toString()
            });
        }

        /**
         * 获取 HLS 的质量级别索引
         * @param {*} QualityIndex 
         */
        function getHLSQualityIndexByQualityIndex(qualityIndex) {
            if (qualityIndex === -1) return -1;
            let qualityIndexList = getQualityIndexList();
            for (let _qualityIndex = qualityIndex; qualityIndex >= 0; qualityIndex--) {
                for (let hlsQualityIndex = 0; hlsQualityIndex < qualityIndexList.length; hlsQualityIndex++) {
                    if (qualityIndexList[hlsQualityIndex] === _qualityIndex) return hlsQualityIndex;
                }
            }
            return null;
        }

        /**
         * 获取的质量级别索引
         * @param {*} hlsQualityIndex 
         */
        function getQualityIndexByHLSQualityIndex(hlsQualityIndex) {
            let qualityIndexList = getQualityIndexList();
            return qualityIndexList[hlsQualityIndex];
        }

        /**
         * 获取视频清晰度列表
         * @function
         * @returns {Array} 视频清晰度索引列表（从质量差到质量好排序）
         */
        function getQualityIndexList() {
            if (_videoData === null) return null;
            let qualityIndexList = [];
            for (let stream of _videoData.stream)
                if (typeof stream.m3u8 === 'string') qualityIndexList.push(parseInt(stream.quality) - 1);
            //排序
            qualityIndexList.sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
            return qualityIndexList;
        }
    }
}

export { AcFunVideoAdapter }