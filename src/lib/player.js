import { AcFunVideoAdapter } from './adapter/acfunVideoAdapter'
import { BulletScreen } from './bulletScreen'
import { Helper } from './helper'
import { Event } from './event'

class Player {
    /**
     * 
     * @param {Element} videoElement 
     * @param {Element} bulletElement 
     */
    constructor(videoElement, bulletElement) {
        /**
         * requestAnimationFrame 定义（一些老式浏览器不支持 requestAnimationFrame ）
         * @param {function} fun - 回调方法 
         * @function
         */
        let requestAnimationFrame;
        if (typeof window.requestAnimationFrame === 'function') requestAnimationFrame = window.requestAnimationFrame;
        else requestAnimationFrame = (fun) => window.setTimeout(fun, 17); //60fps

        videoElement.controls = false;
        let _adapter = new AcFunVideoAdapter(videoElement);
        let _bulletScreen = new BulletScreen(bulletElement, videoElement);
        let _event = new Event();
        let _playNextPartFun = null;
        let _playbackRate = 1;

        _event.add('loadsuccess');
        _event.add('loaderror');

        _event.add('currenttimechanged');
        _event.add('qualityswitching');
        _event.add('qualityswitched');
        _event.add('adapterdestroy');

        _event.add('bulletscreencountchanged');
        _event.add('addbulletscreens');
        _event.add('bulletscreendestroy');
        _event.add('acwebsocketstatuschanged');
        _event.add('onlineuserscountchanged');

        _event.add('loadstart');
        _event.add('progress');
        _event.add('suspend');
        _event.add('abort');
        _event.add('error');
        _event.add('emptied');
        _event.add('stalled');
        _event.add('play');
        _event.add('playing');
        _event.add('pause');
        _event.add('loadedmetadata');
        _event.add('waiting');
        _event.add('canplay');
        _event.add('canplaythrough');
        _event.add('seeking');
        _event.add('seeked');
        _event.add('timeupdate');
        _event.add('ended');
        _event.add('ratechanged');
        _event.add('druationchange');

        _event.add('volumeormutedchanged');

        this.bind = _event.bind;
        this.unbind = _event.unbind;

        _adapter.bind('loadsuccess', () => {
            if (_bulletScreen.getLoadedState() != 0) _event.trigger('loadsuccess', {});
        });

        _bulletScreen.bind('loadsuccess', () => {
            if (_adapter.getLoadedState() === 1) _event.trigger('loadsuccess', {});
        });

        _adapter.bind('destroy', () => {
            _event.trigger('bulletscreendestroy', {});
        });

        _bulletScreen.bind('destroy', () => {
            _event.trigger('adapterdestroy', {});
        });

        _adapter.bind('loaderror', (e) => {
            _event.trigger('loaderror', e);
        });

        _adapter.bind('qualityswitching', (e) => {
            _event.trigger('qualityswitching', e);
        });

        _adapter.bind('qualityswitched', (e) => {
            _event.trigger('qualityswitched', e);
        });

        _bulletScreen.bind('bulletscreencountchanged', (e) => {
            let count = 0;
            for (let n of e.bulletScreenCount) count += n;
            e.bulletScreenCountText = Helper.separateNumber(count);
            _event.trigger('bulletscreencountchanged', e);
        });

        _bulletScreen.bind('addbulletscreens', (e) => {
            for (let bulletScreen of e.newBulletScreens) bulletScreen.startTimeText = Helper.getTimeText(bulletScreen.startTime /= 1000);
            _event.trigger('addbulletscreens', e);
        });

        _bulletScreen.bind('loaderror', (e) => {
            console.warn(`${e.type} ${e.message}`);
            if (_adapter.getLoadedState() === 1) _event.trigger('loadsuccess', {});
        });

        _bulletScreen.bind('acwebsocketstatuschanged', (e) => {
            _event.trigger('acwebsocketstatuschanged', e);
        });
        _bulletScreen.bind('onlineuserscountchanged', (e) => {
            e.onlineUsersCountText = Helper.separateNumber(e.onlineUsersCount);
            _event.trigger('onlineuserscountchanged', e);
        });

        videoElement.addEventListener('loadstart', () => {
            _event.trigger('loadstart', {});
        });

        videoElement.addEventListener('progress', () => {
            _event.trigger('progress', {});
        });

        videoElement.addEventListener('suspend', () => {
            _event.trigger('suspend', {});
        });

        videoElement.addEventListener('abort', () => {
            _event.trigger('abort', {});
        });

        videoElement.addEventListener('error', () => {
            _event.trigger('error', {});
        });

        videoElement.addEventListener('emptied', () => {
            _event.trigger('emptied', {});
        });

        videoElement.addEventListener('stalled', () => {
            _event.trigger('stalled', {});
        });

        videoElement.addEventListener('play', () => {
            _event.trigger('play', {});
        });

        videoElement.addEventListener('playing', () => {
            _event.trigger('playing', {});
        });

        videoElement.addEventListener('pause', () => {
            _event.trigger('pause', {});
        });

        videoElement.addEventListener('loadedmetadata', () => {
            _bulletScreen.connect(Math.round(videoElement.duration));
            _event.trigger('loadedmetadata', {});
        });

        videoElement.addEventListener('waiting', () => {
            _event.trigger('waiting', {});
        });

        videoElement.addEventListener('canplay', () => {
            videoElement.playbackRate = _playbackRate;
            _event.trigger('canplay', {});
        });

        videoElement.addEventListener('canplaythrough', () => {
            _event.trigger('canplaythrough', {});
        });

        videoElement.addEventListener('seeking', () => {
            _event.trigger('seeking', {});
        });

        videoElement.addEventListener('seeked', () => {
            _event.trigger('seeked', {});
        });

        videoElement.addEventListener('timeupdate', () => {
            _event.trigger('timeupdate', {});
        });

        videoElement.addEventListener('ended', () => {
            _event.trigger('ended', {});
            if (_playNextPartFun != null) _playNextPartFun();
        });

        videoElement.addEventListener('ratechange', () => {
            _event.trigger('ratechanged', { playbackRate: videoElement.playbackRate });
        });

        videoElement.addEventListener('druationchange', () => {
            _event.trigger('druationchange', {});
        });

        videoElement.addEventListener('volumechange', () => {
            _event.trigger('volumeormutedchanged', { volume: videoElement.muted ? 0 : videoElement.volume, muted: videoElement.muted });
        });

        this.load = (videoId, autoplay = false) => {
            this.destroy();
            videoElement.autoplay = autoplay;
            _adapter.load(videoId, -1);
            _bulletScreen.load(videoId);
        }

        this.destroy = () => {
            if (_adapter.getLoadedState() === 1) {
                _adapter.destroy();
            }
            if (_bulletScreen.getLoadedState() === 1) _bulletScreen.destroy();
        }

        this.play = videoElement.play;

        this.pause = videoElement.pause;

        this.changePlayState = () => {
            if (videoElement.paused) videoElement.play();
            else videoElement.pause();
        }

        this.stop = () => {
            videoElement.pause();
            videoElement.currentTime = 0;
        }

        this.getPaused = () => videoElement.paused;

        this.getLoop = () => videoElement.loop;
        this.setLoop = (loop) => { videoElement.loop = loop; }

        this.getMuted = () => videoElement.muted;
        this.setMuted = (muted) => {
            videoElement.muted = muted;
            if (videoElement.volume === 0 && !muted) videoElement.volume = 0.5;
        }

        this.getVolume = () => videoElement.volume;
        this.setVolume = (volume) => {
            videoElement.volume = volume;
            if (volume === 0) videoElement.muted = true;
            else videoElement.muted = false;
        };

        this.getCurrentTime = () => videoElement.currentTime;
        this.setCurrentTime = (currentTime) => { videoElement.currentTime = currentTime; }

        this.getPlaybackRate = () => _playbackRate;
        this.setPlaybackRate = (playbackRate) => { _playbackRate = videoElement.playbackRate = playbackRate; }

        this.getBulletScreenOpacity = _bulletScreen.getOpacity;
        this.setBulletScreenOpacity = _bulletScreen.setOpacity;

        this.getDuration = () => videoElement.duration;

        this.getBulletScreenVisibility = _bulletScreen.getVisibility;

        this.hideBulletScreen = _bulletScreen.hide;

        this.showBulletScreen = _bulletScreen.show;

        /**
         * 获取当前视频清晰度
         * @function
         * @returns {number} 视频清晰度索引
         */
        this.getQualityIndex = _adapter.getQualityIndex;

        /**
         * 获取是否启用了自动质量选择
         * @function
         */
        this.getAutoQualityEnabled = _adapter.getAutoQualityEnabled;

        /**
         * 获取视频清晰度列表
         * @function
         * @returns {Array} 视频清晰度索引列表（从质量差到质量好排序）
         */
        this.getQualityIndexList = _adapter.getQualityIndexList;

        /**
         * 切换视频质量
         */
        this.setQualityIndex = _adapter.setQualityIndex;

        this.changeBulletScreenVisibility = () => {
            if (_bulletScreen.getVisibility()) _bulletScreen.hide();
            else _bulletScreen.show();
        }

        this.setPlayNextPartFun = (playNextPartFun) => {
            _playNextPartFun = playNextPartFun;
        }

        this.getHasNextPart = () => _playNextPartFun != null;

        this.playNextPart = () => _playNextPartFun();

        this.sendbulletScreen = (formData) => {
            _bulletScreen.sendbulletScreen(
                videoElement.currentTime,
                formData.get('type'), formData.get('color'),
                formData.get('text'), parseInt(formData.get('size'))
            );
        }


        /**
         * 获取缓冲进度
         */
        function _getBufferProgress() {
            let currentTime = videoElement.currentTime;
            let duration = videoElement.duration;
            if (
                typeof currentTime != 'number' || isNaN(currentTime) ||
                typeof duration != 'number' || isNaN(duration) || duration === 0
            ) return 0;
            //计算并设置已缓存进度
            //buffered返回的是缓存的进度的分段，要查找当前正在播放的分段并显示此分段的结束时间
            //，或者显示要播放的下一个分段的结束时间（分段开始时间等于当前播放时间）
            let buffered = videoElement.buffered;
            if (buffered != null && buffered.length > 0) {
                for (let i = 0; i < buffered.length; i++) {
                    if (buffered.start(i) <= currentTime && buffered.end(i) > currentTime)
                        return buffered.end(i) / duration;
                }
            }
            return currentTime / duration;
        }
        this.getBufferProgress = _getBufferProgress;

        let triggerCurrentTimeChanged = () => {
            let currentTime;
            let duration;
            let bufferProgress = _getBufferProgress();
            currentTime = videoElement.currentTime;
            duration = videoElement.duration;
            if (typeof currentTime != 'number' || isNaN(currentTime)) currentTime = 0;
            if (typeof duration != 'number' || isNaN(duration)) duration = 0;
            _event.trigger('currenttimechanged', {
                currentTime: currentTime,
                duration: duration,
                percent: currentTime === 0 ? 0 : currentTime / duration * 100,
                bufferProgress: bufferProgress,
                bufferPercent: bufferProgress * 100,
                currentTimeText: Helper.getTimeText(currentTime),
                durationText: Helper.getTimeText(duration)
            });
            requestAnimationFrame(triggerCurrentTimeChanged);
        }
        requestAnimationFrame(triggerCurrentTimeChanged);
    }
}

export { Player }