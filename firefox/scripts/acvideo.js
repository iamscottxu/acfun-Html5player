$(function () {
    let webSocketClient; //ACFun弹幕服务器
    let aliplayer; //阿里巴巴播放器
    let videoInfo = {
        videoId: pageInfo.videoId ? pageInfo.videoId : (bgmInfo.videoId ? bgmInfo.videoId : pageInfo.video.videos[0].videoId),
        coverImage: pageInfo.coverImage ? pageInfo.coverImage : (bgmInfo.image ? bgmInfo.image : pageInfo.video.videos[0].image)
    } //视频基本信息
    let bullectCommentsCount;
    ACHtml5Player.ui.setloadingCoverImg(videoInfo.coverImage);
    //弹幕引擎
    let bulletComments = new BulletComments(ACHtml5Player.ui.elements.bulletCommentsDiv[0], {
        clock: function () {
            if (aliplayer == null) return 0;
            return aliplayer.getCurrentTime() * 1000; //替换时间基准为播放器时间
        }
    }, 'css3');
    let bulletCommentsList; //弹幕列表
    let status = 'init';

    //屏蔽整个播放器的右键菜单
    ACHtml5Player.ui.elements.ACHtml5PlayerDiv.on('contextmenu', function (e) {
        if (e.target.id == 'ACHtml5Player_bulletCommentInput') return true;
        return false;
    });

    //循环按钮
    ACHtml5Player.ui.elements.btnLoopDiv.click(changeLoopSwitch);

    //音量/静音按钮
    ACHtml5Player.ui.elements.btnVolumeDiv.click(function (e) {
        if (e.target != this) return;
        changeMuteSwitch();
    });

    //弹幕设置/开关按钮
    ACHtml5Player.ui.elements.btnBulletCommentsDiv.click(function (e) {
        if (e.target != this) return;
        changeBulletCommentsVisibility();
    });

    ACHtml5Player.ui.elements.qualityListDiv.click(function (e) {
        if (e.target == this) return;
        changeQuality($(e.target).data('name'));
    });

    //全屏按钮
    ACHtml5Player.ui.elements.btnFullScreenDiv.click(function (e) {
        if (e.target != this) return;
        setFullScreen(false, null);
    });

    //AcFun播放/暂停动画按钮
    ACHtml5Player.ui.elements.acfunPlayPauseAnimateDiv.click(changeState);

    //弹幕元素
    ACHtml5Player.ui.elements.bulletCommentsDiv.click(changeState);

    //播放元素
    ACHtml5Player.ui.elements.playerDiv.click(changeState);

    //播放/暂停按钮
    ACHtml5Player.ui.elements.btnPlayPauseDiv.click(changeState);
    
    //发送弹幕按钮
    ACHtml5Player.ui.elements.btnBulletCommentSendDiv.click(sendBulletComment);

    //播放进度条
    ACHtml5Player.ui.elements.progressBarDiv.click(function (e) {
        if (status == 'init') return;
        if (e.target.id == 'ACHtml5Player_progressBarHandShank') return;
        videoSeek(aliplayer.getDuration() * e.offsetX / $(this).width());
    });

    ACHtml5Player.ui.elements.progressBarDiv.on('mousemove', function (e) {
        let width = $(this).width();
        let x = e.pageX - $(this).offset().left; //这里用原生的相对坐标会因为鼠标在手柄上而计算相对于手柄的坐标导致出错
        if (x < 0) x = 0;
        else if (x > width) x = width;
        if (status != 'init') {
            let totleTime = aliplayer.getDuration();
            let currentTime = x / width * totleTime;
            let currentMinute = parseInt(parseInt(currentTime) / 60);
            let currentSecond = parseInt(currentTime) % 60;
            ACHtml5Player.ui.elements.progressBarTipDiv.text(
                ACHtml5Player.tools.PrefixInteger(currentMinute, 2) + ':' + ACHtml5Player.tools.PrefixInteger(currentSecond, 2)
            );
        }
        let tipWidth = ACHtml5Player.ui.elements.progressBarTipDiv.outerWidth();
        //防止时间提示框超出范围
        let progressBarTipDivLeft = x - tipWidth / 2;
        if (progressBarTipDivLeft < 0) progressBarTipDivLeft = 0;
        else if (progressBarTipDivLeft + tipWidth > width) progressBarTipDivLeft = width - tipWidth;
        ACHtml5Player.ui.elements.progressBarTipDiv.css('left', progressBarTipDivLeft + 'px');
    });

    //进度滑动手柄
    ACHtml5Player.ui.elements.progressBarHandShankDiv.on({
        mousedown: function () {
            ACHtml5Player.drag = 'progressBarHandShankDiv';
            seekByHandShank();
        },
        mousemove: function (e) {
            if (ACHtml5Player.drag != 'progressBarHandShankDiv') return;
            let width = ACHtml5Player.ui.elements.progressBarDiv.width();
            let x = e.pageX - ACHtml5Player.ui.elements.progressBarDiv.offset().left;
            if (x >= 0 && x <= width) ACHtml5Player.ui.setProgressComplete(x / width);
        }
    });
    $(window).on('mouseup', function () {
        if (ACHtml5Player.drag == 'progressBarHandShankDiv') {
            seekByHandShank();
        }
        ACHtml5Player.drag = null;
    });

    //滑动手柄
    ACHtml5Player.ui.event.onslidebarclick = function (slideBarDiv, number) {
        //音量条/音量滑动手柄
        if (slideBarDiv[0] == ACHtml5Player.ui.elements.volumeSlideBarDiv[0]) {
            changeVolume(number);
        }
    };
    ACHtml5Player.ui.event.onslidebarmousedown = function (slideBarDiv) {
        //音量条/音量滑动手柄
        if (slideBarDiv[0] == ACHtml5Player.ui.elements.volumeSlideBarDiv[0]) {
        }
    };
    ACHtml5Player.ui.event.onslidebarmousemove = function (slideBarDiv, number) {
        //音量条/音量滑动手柄
        if (slideBarDiv[0] == ACHtml5Player.ui.elements.volumeSlideBarDiv[0]) {
            changeVolume(number);
        }
    }
    ACHtml5Player.ui.event.onmouseup = function (element) {
    }

    ACHtml5Player.ui.setCheckBox(
        ACHtml5Player.ui.elements.checkBoxFullScreenDesktopDiv,
        true
    );

    ACHtml5Player.ui.event.oncheckboxchange = function (checkBoxDiv, checked) {
        if (checkBoxDiv[0] == ACHtml5Player.ui.elements.checkBoxFullScreenPageDiv[0]) {
            if (!checked) {
                setFullScreen(false, null);
                return false;
            }
            ACHtml5Player.ui.setCheckBox(
                ACHtml5Player.ui.elements.checkBoxFullScreenDesktopDiv,
                false
            );
            setFullScreen(true, false);
            return true;
        }
        if (checkBoxDiv[0] == ACHtml5Player.ui.elements.checkBoxFullScreenDesktopDiv[0]) {
            if (!checked) {
                setFullScreen(false, null);
                return false;
            }
            ACHtml5Player.ui.setCheckBox(
                ACHtml5Player.ui.elements.checkBoxFullScreenPageDiv,
                false
            );
            setFullScreen(true, true);
            return true;
        }
    }

    //键盘事件
    ACHtml5Player.ui.elements.ACHtml5PlayerDiv.keypress(function (e) {
        if (e.target.id == 'ACHtml5Player_bulletCommentInput') return true;
        switch (e.which) {
            case 32: //空格 暂停
                changeState();
                break;
            case 67: //C 显示/隐藏弹幕
                if (e.shiftKey) changeBulletCommentsVisibility();
                break;
            case 79: //O 开启/关闭循环
                if (e.shiftKey) changeLoopSwitch();
                break;
            case 77: //M 开启/关闭静音
                if (e.shiftKey) changeMuteSwitch();
                break;
            case 70: //F 打开/关闭全屏
                if (e.shiftKey) setFullScreen(false, null);
                break;
            case 90: //Z 展开/收起弹幕池
                if (e.shiftKey)
                    ACHtml5Player.ui.changeFold(ACHtml5Player.ui.elements.foldBarDiv);
                break;
            case 81: //Q 清空屏幕弹幕
                if (e.shiftKey)
                    bulletComments.cleanBulletCommentsOnScreenList();
                break;
        }
        return false;
    });

    ACHtml5Player.ui.elements.ACHtml5PlayerDiv.keyup(function (e) {
        if (e.target.id == 'ACHtml5Player_bulletCommentInput') {
            if (e.which == 13) sendBulletComment();
            return true;
        }
        switch (e.which) {
            case 38: //上方向键 增大音量
                turnUpDownVolume(true);
                break;
            case 40: //下方向键 减小音量
                turnUpDownVolume(false);
                break;
            case 37: //左方向键 快退
                if (e.ctrlKey) {
                    videoSeek(aliplayer.getCurrentTime() - 20);
                    break;
                }
                if (e.shiftKey) {
                    videoSeek(aliplayer.getCurrentTime() - 30);
                    break;
                }
                videoSeek(aliplayer.getCurrentTime() - 10);
                break;
            case 39: //右方向键 快进
                if (e.ctrlKey) {
                    videoSeek(aliplayer.getCurrentTime() + 20);
                    break;
                }
                if (e.shiftKey) {
                    videoSeek(aliplayer.getCurrentTime() + 30);
                    break;
                }
                videoSeek(aliplayer.getCurrentTime() + 10);
                break;
        }
        return false;
    });

    //弹幕服务器认证？
    $.getJSON(
        'http://danmu.aixifan.com/auth/' + videoInfo.videoId,
        function (result) {

        }
    );

    //获取弹幕数
    $.getJSON(
        'http://danmu.aixifan.com/size/' + videoInfo.videoId,
        function (result) {
            bullectCommentsCount = result[0] + result[1] + result[2];
            displayBullectCommentsCount(bullectCommentsCount);
        }
    );

    //加载弹幕
    $.ajax({
        type: "GET",
        url: 'http://danmu.aixifan.com/V4/' + videoInfo.videoId + '/4073558400000/2000?order=-1',
        dataType: "json",
        success: function (result) {
            bulletCommentsList = result[2];
            loadBulletCommentsToList(bulletCommentsList);
            loadBulletComments(bulletCommentsList, bulletComments, 0);
        },
        complete: loadVideo
    });

    //加载视频
    function loadVideo() {
        $.ajax({
            type: "GET",
            url: "http://api.aixifan.com/plays/youku/" + videoInfo.videoId,
            dataType: "json",
            headers: {
                deviceType: 2
            },
            success: function (data) {
                aliplayer = window.ykv(ACHtml5Player.ui.elements.playerDiv[0], {
                    autoplay: false,
                    vid: data.data.sourceId,
                    quality: "hd3",
                    //client_id: "908a519d032263f8",
                    embsig: data.data.embsig,
                    //events: {
                    //onPlayerReady: function() {
                    //}
                    //}
                });

                //播放器视频初始化按钮渲染完毕。
                //播放器UI初始设置需要此事件后触发，避免UI被初始化所覆盖。
                //播放器提供的方法需要在此事件发生后才可以调用。
                aliplayer.on('ready', function (e) {
                    loadWebSocketClient();
                    ACHtml5Player.ui.elements.acfunPlayPauseAnimateDiv.css('display', 'block');
                    settextTime();
                    loadVolume();
                    console.log(aliplayer);
                    window.ACHtml5Player.ui.addQualityToList(aliplayer.currentLang.qualitys, aliplayer.currentType.quality);
                    ACHtml5Player.ui.changeBtnLoopIcon(aliplayer.getOptions().rePlay);
                    ACHtml5Player.ui.hideLoadingShade();
                    status = 'ready';
                });

                //视频由暂停恢复为播放时触发。
                aliplayer.on('play', function (e) { //播放
                    status = 'playing';
                    ACHtml5Player.ui.playOrPauseAnimate(true);
                    ACHtml5Player.ui.changeBtnPlayPauseIcon(false);
                    bulletComments.play();
                });

                //视频暂停时触发。
                aliplayer.on('pause', function (e) {
                    status = 'pause';
                    bulletComments.pause();
                    let totleTime = aliplayer.getDuration();
                    let currentTime = aliplayer.getCurrentTime();
                    if (totleTime != currentTime || !aliplayer.getOptions().rePlay) {
                        status = 'pause';
                        ACHtml5Player.ui.playOrPauseAnimate(false);
                        ACHtml5Player.ui.changeBtnPlayPauseIcon(true);
                    }
                });

                //当前视频播放完毕时触发。
                aliplayer.on('ended', function (e) {
                    bulletComments.stop();
                    loadBulletComments(bulletCommentsList, bulletComments);
                    status = 'ended';
                });
            }
        });
    }

    //通过播放进度手柄设置播放位置
    function seekByHandShank() {
        let totleTime = aliplayer.getDuration();
        let currentTime = ACHtml5Player.ui.getProgressComplete() * totleTime;
        if (ACHtml5Player.drag == 'progressBarHandShankDiv') {
            if (!ACHtml5Player.seekByHandShank_lastCurrentTime ||
                Math.abs(ACHtml5Player.seekByHandShank_lastCurrentTime - currentTime) > 2) videoSeek(currentTime, false);
            ACHtml5Player.seekByHandShank_lastCurrentTime = currentTime;
            setTimeout(seekByHandShank, 500);
        } else {
            ACHtml5Player.seekByHandShank_lastCurrentTime = null;
            videoSeek(currentTime);
        }
    }

    //改变播放时间文本和播放进度条
    function settextTime() {
        //此处循环检查判断切换清晰度是否完成
        if (aliplayer.readyState() != 4) {
            setTimeout(settextTime, 100);
            return;
        }
        //切换清晰度完成后，判断是否要自动播放
        if (status == 'reload_pause') {
            status = 'pause';
        } else if (status == 'reload_playing' || status == 'reload_play') {
            status = 'pause';
            aliplayer.play();
        }

        let totleTime = aliplayer.getDuration();
        let currentTime;
        if (ACHtml5Player.drag == 'progressBarHandShankDiv') {
            currentTime = ACHtml5Player.ui.getProgressComplete() * totleTime;
        } else currentTime = aliplayer.getCurrentTime();
        let totleMinute = parseInt(parseInt(totleTime) / 60);
        let totleSecond = parseInt(totleTime) % 60;
        let currentMinute = parseInt(parseInt(currentTime) / 60);
        let currentSecond = parseInt(currentTime) % 60;
        ACHtml5Player.ui.elements.textTimeDiv.text(
            ACHtml5Player.tools.PrefixInteger(currentMinute, 2) + ':' + ACHtml5Player.tools.PrefixInteger(currentSecond, 2) + '/' +
            ACHtml5Player.tools.PrefixInteger(totleMinute, 2) + ':' + ACHtml5Player.tools.PrefixInteger(totleSecond, 2)
        );
        //设置已播放进度
        if (ACHtml5Player.drag != 'progressBarHandShankDiv') ACHtml5Player.ui.setProgressComplete(currentTime / totleTime);
        //计算并设置以缓存进度
        //buffered返回的是缓存的进度的分段，要查找当前正在播放的分段并显示此分段的结束时间
        //，或者显示要播放的下一个分段的结束时间（分段开始时间等于当前播放时间）
        let buffered = aliplayer.getBuffered();
        if (buffered != null && buffered.length > 0) {
            ACHtml5Player.ui.setProgressBuffer(buffered.end(0) / totleTime);
            for (let i = 0; i < buffered.length; i++) {
                if (buffered.start(i) < currentTime && buffered.end(i) >= currentTime) {
                    ACHtml5Player.ui.setProgressBuffer(buffered.end(i) / totleTime);
                } else if (buffered.start(i) == currentTime) {
                    ACHtml5Player.ui.setProgressBuffer(buffered.end(i) / totleTime);
                }
            }
        }
        requestAnimationFrame(settextTime);
    }

    //改变播放状态
    function changeState() {
        if (aliplayer.readyState() != 4 && aliplayer.readyState() != 2) return;
        if (status == 'play' || status == 'playing' || status == 'ready' || status == 'pause') {
            if (aliplayer.paused()) aliplayer.play();
            else aliplayer.pause();
        } else if (status == 'ended') {
            aliplayer.replay();
        }
    }

    //设置弹幕数
    function displayBullectCommentsCount(bullectCommentsCount) {
        let countText = ACHtml5Player.tools.format_number(bullectCommentsCount);
            $('.danmu .sp2').text(countText);
            $('#ACHtml5Player_bulletCommentsCount').text(countText);
    }

    //加载弹幕到弹幕列表
    function loadBulletCommentsToList(bulletCommentsList) {
        ACHtml5Player.ui.elements.bulletCommentsListTable.find('.row').remove();
        if (bulletCommentsList == null) {
            ACHtml5Player.ui.elements.bulletCommentsEmptyDiv.css('display', 'block');
            return;
        }
        ACHtml5Player.ui.elements.bulletCommentsEmptyDiv.css('display', 'none');
        for (let bulletComment of bulletCommentsList) {
            loadBulletCommentToList(bulletComment)
        }
    }

    //追加弹幕
    function loadBulletCommentToList(bulletComment) {
        let info = bulletComment.c.split(',');
            let text = bulletComment.m;
            let tr = $('<tr class="row"></tr>');
            tr.attr('data-uuid', info[6]);
            tr.attr('data-userid', info[4]);
            tr.attr('data-starttime', info[0]);
            let tdTime = $('<td style="width: 45px;text-align: center;"></td>');
            let time = parseInt(info[0]);
            let minute = parseInt(time / 60);
            let second = time % 60;
            tdTime.text(ACHtml5Player.tools.PrefixInteger(minute, 2) + ':' + ACHtml5Player.tools.PrefixInteger(second, 2));
            tr.append(tdTime);
            let tdText = $('<td></td>');
            tdText.text(text);
            tr.append(tdText);
            ACHtml5Player.ui.elements.bulletCommentsListTable.prepend(tr);
            //弹幕列表项点击事件
            tr.click(function () {
                //跳转到弹幕发出时间
                videoSeek(parseInt($(this).data('starttime')));
            });
    }

    //设置视频位置
    function videoSeek(time, needloadBulletComments = true) {
        if (status == 'init') return;
        let totleTime = aliplayer.getDuration();
        if (time < 0) time = 0;
        else if (time > totleTime) time = totleTime;
        if (needloadBulletComments) {
            bulletComments.cleanBulletCommentList();
            loadBulletComments(bulletCommentsList, bulletComments, time);
        }
        aliplayer.seek(time);
        if (status == 'play' || status == 'playing') bulletComments.play();
    }

    //加载弹幕
    function loadBulletComments(bulletCommentsList, bulletComments, loadStartTime) {
        if (bulletCommentsList == null) return;
        for (let bulletComment of bulletCommentsList) {
            loadBulletComment(bulletComment, bulletComments, loadStartTime);
        }
    }

    //追加弹幕
    function loadBulletComment(bulletComment, bulletComments, loadStartTime, newBulletComment = false) {
        //传输格式：开始时间（相对于视频,秒）,颜色（16进制RGB值的十进制表示）,
        //类型,字号（像素）,发送用户的编号,发送日期,弹幕编号（早期视频为编号，新视频为UUID）
        let info = bulletComment.c.split(',');
        if (Number(info[0]) < loadStartTime) return; //当前弹幕开始时间小于加载开始时间
        let text = bulletComment.m;
        let type = 0;
        let speed = 0.10 + bulletComment.m.length / 200; //弹幕越长，速度越快
        if (speed > 0.20) speed = 0.20;
        switch (Number(info[2])) {
            case 1:
                type = 0; //流弹幕
                break;
            case 2:
                type = 1; //逆向弹幕 猜测
                break;
            case 3:
                type = 0; //游客弹幕 猜测
                break;
            case 4:
                type = 3; //顶部弹幕
                break;
            case 5:
                type = 2; //底部弹幕
                break;
        }
        bulletComments.addBulletComment({
            uuid: info[6], //uuid
            userid: info[4], //用户编号
            text: text, //文本
            type: type, //类型
            speed: speed, //速度
            color: '#' + Number(info[1]).toString(16), //颜色
            boxColor: newBulletComment ? '#6EFFFE': null, //边框颜色
            size: Number(info[3]), //字号
            startTime: Number(info[0]) * 1000 //开始时间
        });
    };

    //ACFun弹幕服务器
    function loadWebSocketClient() {
        let totleTime = aliplayer.getDuration();
        let refresh = function () {
            webSocketClient.refreshOnlineUsersCount();
        }
        webSocketClient = new ACHtml5Player.webSocketClient(
            videoInfo.videoId,
            parseInt(totleTime),
            $.cookie('auth_key'),
            $.cookie('auth_key_ac_sha1'),
            $.cookie('_did')
        )
        webSocketClient.onConnected = function () {
            refresh();
        }
        webSocketClient.connect();
        webSocketClient.onOnlineUsersCountChange = function (number) {
            ACHtml5Player.ui.elements.onlineUsersCountDiv.text(window.ACHtml5Player.tools.format_number(number));
        }
        setInterval(refresh, 10000);
    }

    //加载音量
    function loadVolume() {
        if (aliplayer == null) return;
        if (aliplayer.getVolume() == 0) {
            aliplayer.mute();
            aliplayer.setVolume(0.5);
        }
        let muted = aliplayer.muted();
        let volume = muted ? 0 : aliplayer.getVolume();
        ACHtml5Player.ui.setVolumeNumber(volume);
        ACHtml5Player.ui.elements.volumeNumberDiv.text(parseInt(volume * 100));
        ACHtml5Player.ui.changeBtnVolumeIcon(muted);
    }

    //改变音量
    function changeVolume(volume) {
        aliplayer.unMute();
        if (volume < 0) volume = 0;
        else if (volume > 1) volume = 1;
        aliplayer.setVolume(volume);
        loadVolume();
    }

    //增加/减少音量
    function turnUpDownVolume(turnUp) {
        let volume = parseInt(aliplayer.getVolume() * 100);
        if (turnUp) volume += 10;
        else volume -= 10;
        changeVolume(volume / 100);
    }

    function setFullScreen(fullScreen, desktop) {
        if (fullScreen == false) {
            fullScreen = !ACHtml5Player.ui.getFullScreen();
        }
        if (desktop == null) {
            desktop = ACHtml5Player.ui.getCheckBox(ACHtml5Player.ui.elements.checkBoxFullScreenDesktopDiv);
        }
        if (desktop && fullScreen) {
            ACHtml5Player.tools.launchFullscreen(document.documentElement);
            let fullscreenChange = function () {
                let fullScreenDesktop = ACHtml5Player.ui.getFullScreenDesktop();
                if (fullScreenDesktop) {
                    ACHtml5Player.tools.removeScreenchangeEventListener();
                    let desktop = ACHtml5Player.ui.getCheckBox(ACHtml5Player.ui.elements.checkBoxFullScreenDesktopDiv);
                    if (desktop) ACHtml5Player.ui.setFullScreen(false);
                    ACHtml5Player.ui.setFullScreenDesktop(false);
                    if (ACHtml5Player.controlBarsHideMousemove) $('body').off('mousemove', ACHtml5Player.controlBarsHideMousemove);
                    if (ACHtml5Player.controlBarsHideTimeOut) clearTimeout(ACHtml5Player.controlBarsHideTimeOut);
                    ACHtml5Player.ui.changeControlBarsVisibility(true);
                } else {
                    ACHtml5Player.ui.setFullScreen(true);
                    ACHtml5Player.ui.setFullScreenDesktop(true);
                    ACHtml5Player.controlBarsHideTimeOut = setTimeout(hideControlBars, 2000);
                    ACHtml5Player.controlBarsHideMousemove = function () {
                        ACHtml5Player.ui.changeControlBarsVisibility(true);
                        if (ACHtml5Player.controlBarsHideTimeOut) clearTimeout(ACHtml5Player.controlBarsHideTimeOut);
                        ACHtml5Player.controlBarsHideTimeOut = setTimeout(hideControlBars, 2000);
                    }
                    $('body').on('mousemove', ACHtml5Player.controlBarsHideMousemove);
                    return;
                }
            };
            ACHtml5Player.tools.addScreenchangeEventListener(fullscreenChange);
        } else {
            ACHtml5Player.tools.exitFullscreen();
        }
        ACHtml5Player.ui.setFullScreen(fullScreen);
    }

    function hideControlBars() {
        if (!ACHtml5Player.ui.getFullScreenDesktop()) return;

        ACHtml5Player.ui.changeControlBarsVisibility(false);
    }

    //切换清晰度
    function changeQuality(quality) {
        if (aliplayer.readyState() != 4 && aliplayer.readyState() != 2) return;
        if (quality == aliplayer.currentType.quality) return;
        let qualitys = aliplayer.currentLang.qualitys;
        let qualityId = null;
        for (let i in qualitys) {
            if (quality == qualitys[i]) {
                qualityId = i;
                break;
            }
        }
        if (qualityId == null) return;
        let m3u8Url = null;
        for (let stream of aliplayer.videoData.stream) {
            if (parseInt(stream.quality) == parseInt(qualityId) + 1
                && !(typeof (stream.m3u8) === 'undefined')) {
                m3u8Url = stream.m3u8;
                break;
            }
        }
        if (m3u8Url == null) return;
        aliplayer.currentType = aliplayer.currentLang.types[qualityId];
        aliplayer.loadByUrl(m3u8Url, aliplayer.getCurrentTime(), !aliplayer.paused());
        status = 'reload_' + status;
        window.ACHtml5Player.ui.setQualityText(aliplayer.currentType.quality);
    }

    //显示/隐藏弹幕
    function changeBulletCommentsVisibility() {
        if (bulletComments.getVisibility()) {
            bulletComments.hide();
            ACHtml5Player.ui.changeBtnBulletCommentsIcon(false);
        } else {
            bulletComments.show();
            ACHtml5Player.ui.changeBtnBulletCommentsIcon(true);
        }
    }

    //开启/关闭循环
    function changeLoopSwitch() {
        ACHtml5Player.ui.changeBtnLoopIcon(
            aliplayer.getOptions().rePlay = !aliplayer.getOptions().rePlay
        );
    }

    //开启/关闭静音
    function changeMuteSwitch() {
        if (status == 'init') return;
        if (aliplayer.muted()) aliplayer.unMute();
        else aliplayer.mute();
        loadVolume();
    }

    //发送弹幕
    function sendBulletComment() {
        if (status == 'init') return;
        let text = ACHtml5Player.ui.elements.bulletCommentInput.val();
        if (text == '') return;
        if (!ACHtml5Player.ui.disabeBulletCommentSendBtn()) return;
        ACHtml5Player.ui.elements.bulletCommentInput.val('');
        let fontSize = 25;
        let textColor = 16777215;
        let bulletCommentType = 1;
        let totleTime = aliplayer.getDuration();
        let currentTime = aliplayer.getCurrentTime();
        let dateTime = new Date().getTime();
        let bulletComment = {
            c: (currentTime + 0.5 > totleTime ? totleTime : currentTime) + ',' + textColor + ',' + bulletCommentType + ',' + fontSize + ',' + $.cookie('auth_key') + ',' + dateTime + ',0',
            m: text
        }
        loadBulletComment(bulletComment, bulletComments, currentTime, true);
        loadBulletCommentToList(bulletComment);
        displayBullectCommentsCount(++bullectCommentsCount);
        bulletCommentsList.push(bulletComment);
        webSocketClient.sendbulletComment(currentTime, bulletCommentType, dateTime, textColor, text, fontSize);
    }

    //接收弹幕

    //销毁
    window.ACHtml5Player.dispose = function() {
        aliplayer.dispose();
        delete window.ACHtml5Player;
    }
});