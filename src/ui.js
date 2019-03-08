import { Helper } from './lib/helper'
import { SlideBar } from './lib/slideBar'
import Emoticons from './emoticons.json'
import PerfectScrollbar from 'perfect-scrollbar'

let $ = require('jquery');
$ = require('tooltipster');

const qualityName = [
    '标清',
    '高清',
    '超清',
    '1080p'
]

let LoadUI = (player, coverImage) => {

    $('#player').css('position', '');
    $('.noflash-alert').remove();
    $('#ACHtml5Player_loadingCover').css('background-image', `url(${coverImage})`);

    const bulletScreenScrollbar = new PerfectScrollbar('.ACHtml5Player-bulletScreenScrolly', {
        suppressScrollX: true
    });

    const boxEmoticonsScrollbar = new PerfectScrollbar('.ACHtml5Player-boxEmoticonsScrolly', {
        suppressScrollX: true
    });

    const volumeSlideBar = new SlideBar('#ACHtml5Player_volumeSlideBarBox', true, true);

    const bulletScreenOpacitySlideBar = new SlideBar('#ACHtml5Player_bulletScreenOpacitySlideBarBox', true, false);
    $('#ACHtml5Player_bulletScreenOpacitySlideBarBox .ACHtml5Player-slideBarHandShank').append('<span><span id="ACHtml5Player_bulletScreenOpacityNumber">0</span>%</span>');

    player.bind('loadsuccess', () => {
        loadQualityList();
        setBtnQuality();
    });

    player.bind('loaderror', (e) => {
        $('#ACHtml5Player_errorTipWindow').text(`${e.errorType} ${e.message}`);
        $('#ACHtml5Player_errorTipCover').show();
    });


    player.bind('error', (e) => {
        $('#ACHtml5Player_errorTipWindow').text(`${e.errorType} ${e.message}`);
        $('#ACHtml5Player_errorTipCover').show();
    });

    player.bind('bulletscreendestroy', () => {
        $('#ACHtml5Player_bulletScreenList').empty();
        $('#ACHtml5Player_bulletScreenEmpty').show();
    });

    player.bind('adapterdestroy', () => {
        $('#ACFlashPlayer').remove();
        $('#ACHtml5Player_loadingShade').show();
        $('#ACHtml5Player_errorTipCover').hide();
    });

    player.bind('loadedmetadata', () => {
        setBtnNext();
        $('#ACHtml5Player_loadingShade').hide();
        $('#ACHtml5Player_acfunPlayPauseAnimate').addClass('ACHtml5Player-acfunPlayPauseAnimate-show');
    });

    player.bind('waiting', () => {
        let picId = Helper.pad(1 + Math.floor(Math.random() * 55), 2);
        $('#ACHtml5Player_watingAnimate_img').css('background-image',
            `url(//cdn.aixifan.com/dotnet/20130418/umeditor/dialogs/emotion/images/ac/${picId}.gif)`);
        $('#ACHtml5Player_watingAnimate').show();
    });

    player.bind('canplay', () => {
        $('#ACHtml5Player_watingAnimate').hide();
    });

    player.bind('play', () => {
        $('#ACHtml5Player_btnPlayPause').removeClass('ACHtml5Player-resource-play');
        $('#ACHtml5Player_btnPlayPause').addClass('ACHtml5Player-resource-pause');
        $('#ACHtml5Player_acfunPlayPauseAnimate').removeClass('ACHtml5Player-acfunPlayPauseAnimate-show');
        $('#ACHtml5Player_acfunPlayPauseAnimate').addClass('ACHtml5Player-acfunPlayPauseAnimate-hide');
    });

    let _pauseEvent = () => {
        $('#ACHtml5Player_btnPlayPause').removeClass('ACHtml5Player-resource-pause');
        $('#ACHtml5Player_btnPlayPause').addClass('ACHtml5Player-resource-play');
        $('#ACHtml5Player_acfunPlayPauseAnimate').removeClass('ACHtml5Player-acfunPlayPauseAnimate-hide');
        $('#ACHtml5Player_acfunPlayPauseAnimate').addClass('ACHtml5Player-acfunPlayPauseAnimate-show');
    }

    player.bind('emptied', _pauseEvent);

    player.bind('pause', _pauseEvent);

    player.bind('currenttimechanged', (e) => {
        $('#ACHtml5Player_textCurrentTime').text(e.currentTimeText);
        $('#ACHtml5Player_textDuration').text(e.durationText);
        $('#ACHtml5Player_progressBarBuffer').css('width', `${e.bufferPercent}%`);
        if (progressMousedown) return;
        $('#ACHtml5Player_progressBarComplete').css('width', `${e.percent}%`);
    });

    player.bind('bulletscreencountchanged', (e) => {
        $('.danmu.fl > .sp2').text(e.bulletScreenCountText);
        $('#ACHtml5Player_bulletScreenCount').text(e.bulletScreenCountText);
    });

    player.bind('onlineuserscountchanged', (e) => {
        $('#ACHtml5Player_onlineUsersCount').text(e.onlineUsersCountText);
    });

    player.bind('acwebsocketstatuschanged', (e) => {
        if (e.newStatus === 'connected') $('#ACHtml5Player_btnBulletScreenSend').removeClass('disable');
        else $('#ACHtml5Player_btnBulletScreenSend').addClass('disable');
        if (e.newStatus === 'connected_notIdentified') $('#ACHtml5Player_bulletScreenInputArea').addClass('ACHtml5Player-login');
        else $('#ACHtml5Player_bulletScreenInputArea').removeClass('ACHtml5Player-login');
    });

    player.bind('qualityswitching', (e) => {
        setBtnQuality(e.qualityIndex);
    });

    player.bind('qualityswitched', (e) => {
        setBtnQuality(e.qualityIndex);
    });

    player.bind('addbulletscreens', (e) => {
        if (e.cleanOld) {
            $('#ACHtml5Player_bulletScreenList').empty();
            $('#ACHtml5Player_bulletScreenEmpty').show();
        }
        if (e.newBulletScreens.length > 0) $('#ACHtml5Player_bulletScreenEmpty').hide();
        for (let bulletScreen of e.newBulletScreens) {
            let tr = $('<tr></tr>');
            tr.attr('data-uuid', bulletScreen.uuid);
            tr.attr('data-userid', bulletScreen.userid);
            tr.attr('data-starttime', bulletScreen.startTime);
            let startTimeTh = $('<th style="width:45px;text-align:center" class="ACHtml5Player-textTooltip"></th>');
            startTimeTh.text(bulletScreen.startTimeText);
            startTimeTh.attr('title', bulletScreen.startTimeText);
            tr.append(startTimeTh);
            let textTh = $('<th class="ACHtml5Player-textTooltip"></th>');
            textTh.text(bulletScreen.text);
            textTh.attr('title', bulletScreen.text);
            tr.append(textTh);
            $('#ACHtml5Player_bulletScreenList').prepend(tr);
        }
        bulletScreenScrollbar.update();
        loadTextToolTip();
    });

    player.bind('volumeormutedchanged', (e) => {
        setVolmueAndMuted(e.volume, e.muted);
    });

    player.bind('ratechanged', (e) => {
        $('#ACHtml5Player_btnSpeed > span').text(e.playbackRate === 1 ? '倍速' : `${e.playbackRate}倍`);
    });

    bulletScreenOpacitySlideBar.bind('valuechanged', (e) => {
        $('#ACHtml5Player_bulletScreenOpacityNumber').text(Math.round(e.value * 100));
    });

    bulletScreenOpacitySlideBar.bind('valuechangedbyui', (e) => {
        player.setBulletScreenOpacity(e.value);
    });

    volumeSlideBar.bind('valuechanged', (e) => {
        $('#ACHtml5Player_volumeNumber').text(Math.round(e.value * 100));
    });

    volumeSlideBar.bind('valuechangedbyui', (e) => {
        player.setVolume(e.value);
    });

    //快捷键支持
    $('#ACHtml5Player').keypress((e) => {
        if ($(e.target).is('input[type="text"]')) return true;
        switch (e.which) {
            case 32: //空格 暂停
                player.changePlayState();
                return false;
            case 13: //回车 弹幕输入焦点
                $('#ACHtml5Player_bulletScreenInput').focus();
                return false;
            case 67: //C 显示/隐藏弹幕
                if (e.shiftKey) {
                    player.changeBulletScreenVisibility();
                    setBtnBulletScreenIcon();
                    return false;
                }
                break;
            case 79: //O 开启/关闭循环
                if (e.shiftKey) {
                    player.setLoop(!player.getLoop());
                    setBtnLoopIcon();
                    return false;
                }
                break;
            case 77: //M 开启/关闭静音
                if (e.shiftKey) {
                    player.setMuted(!player.getMuted());
                    return false;
                }
                break;
            case 70: //F 打开/关闭全屏
                if (e.shiftKey) {
                    changeFullScreen();
                    return false;
                }
                break;
            case 81: //Q 清空屏幕弹幕
                if (e.shiftKey) {
                    player.cleanBulletScreen();
                    return false;
                }
                break;
            case 90: //Z 展开/收起弹幕池
                if (e.shiftKey) {
                    changeFoldVisibility();
                    return false;
                }
                break;
        }
        return true;
    });
    $('#ACHtml5Player').keydown((e) => {
        if ($(e.target).is('input[type="text"]')) return true;
        switch (e.which) {
            case 37: //左方向键 快退
                if (e.ctrlKey) player.setCurrentTime(player.getCurrentTime() - 20);
                else if (e.shiftKey) player.setCurrentTime(player.getCurrentTime() - 30);
                else player.setCurrentTime(player.getCurrentTime() - 10);
                return false;
            case 39: //右方向键 快进
                if (e.ctrlKey) player.setCurrentTime(player.getCurrentTime() + 20);
                else if (e.shiftKey) player.setCurrentTime(player.getCurrentTime() + 30);
                else player.setCurrentTime(player.getCurrentTime() + 10);
                return false;
            case 38: //上方向键 增大音量
                player.setVolume(player.getVolume() + 0.1);
                return false;
            case 40: //下方向键 减小音量
                player.setVolume(player.getVolume() - 0.1);
                return false;
        }
        return true;
    });
    $('#ACHtml5Player_bulletScreenInput').keydown((e) => {
        if (e.which === 27) //Esc
        {
            $('#ACHtml5Player').focus();
            return false;
        }
        return true;
    });

    $('#ACHtml5Player_btnVolume').click(function (e) {
        if (e.target != this) return;
        player.setMuted(!player.getMuted());
    });

    $('#ACHtml5Player_bulletScreenList').click((e) => {
        if (e.target.tagName.toLowerCase() === 'th') player.setCurrentTime(parseFloat($(e.target).parent('tr').data('starttime')));
    });

    $('#ACHtml5Player_acfunPlayPauseAnimate').click((e) => {
        if ($(e.target).hasClass('ACHtml5Player-acfunPlayPauseAnimate-show')) player.changePlayState();
    });

    $('#ACHtml5Player_btnPlayPause').click(() => {
        player.changePlayState();
    });

    $('#ACHtml5Player_btnNext').click(() => {
        player.playNextPart();
    });

    //区分单击和双击事件
    let bulletScreensClickTimer = null;
    $('#ACHtml5Player_bulletScreens').click(() => {
        clearTimeout(bulletScreensClickTimer);
        bulletScreensClickTimer = setTimeout(player.changePlayState, 500);
    });

    $('#ACHtml5Player_bulletScreens').dblclick((e) => {
        clearTimeout(bulletScreensClickTimer);
        changeFullScreen();
    });

    $('#ACHtml5Player_btnBulletScreen').click(function (e) {
        if (e.target != this) return;
        player.changeBulletScreenVisibility();
        setBtnBulletScreenIcon();
    });

    $('#ACHtml5Player_btnLoop').click(() => {
        player.setLoop(!player.getLoop());
        setBtnLoopIcon();
    });

    $('#ACHtml5Player_color_picker_panel').click((e) => {
        if (!$(e.target).hasClass('color-span')) return;
        let color = `#${$(e.target).data('color')}`;
        $('#ACHtml5Player_color_picker_code').val(color);
        $('#ACHtml5Player_color_picker_current').css('background-color', color);
    });

    $('#ACHtml5Player_color_picker_code').change((e) => {
        let val = $(e.target).val();
        if (val.search(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/) === -1) {
            $(e.target).val(e.target.oldValue);
            return;
        }
        val = val.toLocaleUpperCase();
        if (val.length === 4) {
            let r = val.substr(1,1), g = val.substr(2,1), b = val.substr(3,1);
            val = `#${r}${r}${g}${g}${b}${b}`;
        }
        $(e.target).val(val);
        $('#ACHtml5Player_color_picker_current').css('background-color', val);
        e.target.oldValue = val;
    });

    $('#ACHtml5Player_color_picker_code').keypress((e) => {
        if (e.which === 13) {
            $(e.target).change();
            return false;
        }
        return true;
    });

    $('#ACHtml5Player_color_picker_code').hover((e) => {
        e.target.oldValue = $(e.target).val();
    });

    $('#ACHtml5Player_bulletScreenSendForm').submit((e) => {
        let btn = $('#ACHtml5Player_btnBulletScreenSend');
        if (btn.hasClass('disable') || btn.hasClass('countdown') ||
            $('#ACHtml5Player_bulletScreenSendForm input[name="text"]').val() === '') return false;
        let countdownNumber = 3;
        let countdown = () => {
            if (countdownNumber === 0) btn.removeClass('countdown');
            else {
                $('#ACHtml5Player_btnBulletScreenSend_countdownNumber').text(countdownNumber--);
                setTimeout(countdown, 1000);
            }
        }
        btn.addClass('countdown');
        countdown();
        player.sendbulletScreen(new FormData($('#ACHtml5Player_bulletScreenSendForm')[0]));
        $('#ACHtml5Player_bulletScreenSendForm input[name="text"]').val('');
        return false;
    });

    $('#ACHtml5Player_qualityList').click((e) => {
        if (e.target.tagName.toLowerCase() === 'li') {
            let qualityIndex = $(e.target).data('index');
            player.setQualityIndex(qualityIndex);
            $('#ACHtml5Player_btnQuality > span').text(qualityIndex === -1 ? `自动（${qualityName[player.getQualityIndex()]}）` : qualityName[qualityIndex]);
        }
    });

    $('#ACHtml5Player_speedList').click((e) => {
        if (e.target.tagName.toLowerCase() === 'li') player.setPlaybackRate($(e.target).data('rate'));
    });

    $('#ACHtml5Player_boxEmoticons').click((e) => {
        if ($(e.target).hasClass('ACHtml5Player-btnEmoticons')) {
            let input = $('#ACHtml5Player_bulletScreenSendForm input[name="text"]');
            input.val(input.val() + $(e.target).text());
        }
    });

    $('#ACHtml5Player_foldBar').click(changeFoldVisibility);

    $('#ACHtml5Player_popupBulletScreenForm').click(() => {
        let formData = new FormData($('#ACHtml5Player_popupBulletScreenForm')[0]);
        let hiddenTypesList = formData.getAll('hiddenTypes');
        let hiddenTypes = 0;
        for (let index in hiddenTypesList) hiddenTypes += parseInt(hiddenTypesList[index]);
        player.setBulletScreenHiddenTypes(hiddenTypes);
    });

    $('#ACHtml5Player_progressBar').click((e) => {
        if ($(e.target).hasClass('ACHtml5Player-progressBarTip') || $(e.target).hasClass('ACHtml5Player-progressBarHandShank')) return;
        let time = parseFloat($('#ACHtml5Player_progressBarTip').attr('data-time'));
        if (isNaN(time)) return;
        player.setCurrentTime(time);
    });

    $('#ACHtml5Player_progressBar').mousemove((e) => {
        if ($(e.target).hasClass('ACHtml5Player-progressBarTip')) return;
        let progressBarDiv = $('#ACHtml5Player_progressBar'), progressBarTipDiv = $('#ACHtml5Player_progressBarTip');
        let progressBarTipDivOuterWidth = progressBarTipDiv.outerWidth(), progressBarDivWidth = progressBarDiv.width();
        let X = e.pageX - progressBarDiv.offset().left, left = X - progressBarTipDivOuterWidth / 2, duration = player.getDuration();
        if (typeof duration != 'number' || isNaN(duration) || duration === 0) progressBarTipDiv.text('00:00');
        else {
            let time = duration * X / progressBarDivWidth;
            progressBarTipDiv.text(Helper.getTimeText(time));
            progressBarTipDiv.attr('data-time', time);
        }
        progressBarTipDiv.css('left', left < 0 ? 0 : left + progressBarTipDivOuterWidth > progressBarDivWidth ? progressBarDivWidth - progressBarTipDivOuterWidth : left);
    });

    let progressMousedown;
    $('#ACHtml5Player_progressBarHandShank').mousedown((e) => { progressMousedown = true; progressMousedownLastEvent = e; });

    $('body').mouseup(() => { progressMousedown = false; });

    $('body').mouseleave(() => { progressMousedown = false; });

    let progressMousedownLastEvent;
    $('body').mousemove((e) => {
        if (progressMousedown) {
            let progressBarDiv = $('#ACHtml5Player_progressBar');
            let value = (e.pageX - progressBarDiv.offset().left) / progressBarDiv.width();
            $('#ACHtml5Player_progressBarComplete').css('width', `${value * 100}%`);
            if (Math.abs(e.pageX - progressMousedownLastEvent.pageX) <= 5) return; //防鼠标抖动
            progressMousedownLastEvent = e;
            let duration = player.getDuration();
            if (typeof duration != 'number' || isNaN(duration) || duration === 0) return;
            player.setCurrentTime(duration * value);
        }
    });

    $('#ACHtml5Player_btnFullScreen').click(function (e) {
        if (e.target != this && e.target.tagName.toLowerCase() != 'input') return;
        changeFullScreen();
    });

    $('.ACHtml5Player-barButton,.ACHtml5Player-barButtonToolTip').click(function (e) {
        if (e.target != this) return;
        let clickPopupBoxDiv;
        if ($(this).hasClass('ACHtml5Player-barButtonToolTip')) clickPopupBoxDiv = $(this).siblings('.ACHtml5Player-clickPopupBox');
        else clickPopupBoxDiv = $(this).find('.ACHtml5Player-clickPopupBox');
        if (clickPopupBoxDiv.length != 1) return;
        if (clickPopupBoxDiv.css('display') == 'none') {
            $('.ACHtml5Player-clickPopupBox').hide(0);
            clickPopupBoxDiv.show();
        } else clickPopupBoxDiv.hide(0);
    });

    $('.ACHtml5Player-clickPopupBox').mouseleave(function (e) {
        if (e.target != this) return;
        $(e.target).delay(500).hide(0);
    });

    $('.ACHtml5Player-clickPopupBox').mouseenter(function (e) {
        if (e.target != this) return;
        $(e.target).clearQueue();
    });

    let controlBarsHideTimeOut;
    Helper.addScreenchangeEventListener(() => {
        if (Helper.getFullscreenElement() === $('#ACHtml5Player')[0]) {
            $('#ACHtml5Player_progressBar').prependTo('#ACHtml5Player_controlBars');
            $('body').addClass('ACHtml5Player-fullScreen');
            $('#ACHtml5Player_bulletScreenSendForm').prependTo('#ACHtml5Player_controlBar_control');
            $('body').addClass('ACHtml5Player-fullScreen-desktop');
            $('#ACHtml5Player').on('mousemove', controlBarsHideMousemoveEvent);
            controlBarsHideMousemoveEvent();
        } else {
            let fullScreenType = new FormData($('#ACHtml5Player_btnFullScreen form')[0]).get('fullScreenType');
            $('#ACHtml5Player').off('mousemove', controlBarsHideMousemoveEvent);
            if (controlBarsHideTimeOut) clearTimeout(controlBarsHideTimeOut);
            $('#ACHtml5Player').removeClass('ACHtml5Player-hideControlBars');
            $('#ACHtml5Player_progressBar').appendTo('#ACHtml5Player_main');
            $('body').removeClass('ACHtml5Player-fullScreen-desktop');
            if (fullScreenType === 'desktop') {
                $('body').removeClass('ACHtml5Player-fullScreen');
                $('#ACHtml5Player_bulletScreenSendForm').prependTo('#ACHtml5Player_controlBar_bulletScreen');
            }
        }
    });

    function controlBarsHideMousemoveEvent() {
        $('#ACHtml5Player').removeClass('ACHtml5Player-hideControlBars');
        if (controlBarsHideTimeOut) clearTimeout(controlBarsHideTimeOut);
        controlBarsHideTimeOut = setTimeout(() => {
            if (Helper.getFullscreenElement() != $('#ACHtml5Player')[0]) return;
            $('#ACHtml5Player').addClass('ACHtml5Player-hideControlBars');
        }, 2000);
    }

    function changeFoldVisibility() {
        if ($('#ACHtml5Player').hasClass('fold')) $('#ACHtml5Player').removeClass('fold');
        else $('#ACHtml5Player').addClass('fold');
    }

    function setBtnLoopIcon() {
        if (player.getLoop()) {
            $('#ACHtml5Player_btnLoop').removeClass('ACHtml5Player-resource-loopOff');
            $('#ACHtml5Player_btnLoop').addClass('ACHtml5Player-resource-loopOn');
        } else {
            $('#ACHtml5Player_btnLoop').removeClass('ACHtml5Player-resource-loopOn');
            $('#ACHtml5Player_btnLoop').addClass('ACHtml5Player-resource-loopOff');
        }
    }

    function setBtnBulletScreenIcon() {
        if (player.getBulletScreenVisibility()) {
            $('#ACHtml5Player_btnBulletScreen').removeClass('ACHtml5Player-resource-bulletScreenOff');
            $('#ACHtml5Player_btnBulletScreen').addClass('ACHtml5Player-resource-bulletScreenOn');
        } else {
            $('#ACHtml5Player_btnBulletScreen').removeClass('ACHtml5Player-resource-bulletScreenOn');
            $('#ACHtml5Player_btnBulletScreen').addClass('ACHtml5Player-resource-bulletScreenOff');
        }
    }

    function setBtnNext() {
        if (player.getHasNextPart()) $('#ACHtml5Player_btnNext').show();
        else $('#ACHtml5Player_btnNext').hide();
    }

    function setRadioFullScreen() {
        $('#ACHtml5Player_btnFullScreen form input[value="desktop"]').prop({ checked: true });
    }

    function setVolmueAndMuted(volume = player.getVolume(), muted = player.getMuted()) {
        if (muted) {
            $('#ACHtml5Player_btnVolume').removeClass('ACHtml5Player-resource-volume');
            $('#ACHtml5Player_btnVolume').addClass('ACHtml5Player-resource-mute');
        } else {
            $('#ACHtml5Player_btnVolume').removeClass('ACHtml5Player-resource-mute');
            $('#ACHtml5Player_btnVolume').addClass('ACHtml5Player-resource-volume');
        }
        volumeSlideBar.set(volume);
    }

    function loadBulletScreenSettings() {
        bulletScreenOpacitySlideBar.set(player.getBulletScreenOpacity());
    }

    function loadQualityList() {
        let qualityIndexList = player.getQualityIndexList();
        let ul = $('#ACHtml5Player_qualityList');
        ul.empty();
        ul.prepend('<li data-index="-1">自动</li>');
        for (let qualityIndex of qualityIndexList) {
            let li = $('<li></li>');
            li.text(qualityName[qualityIndex]);
            li.attr('data-index', qualityIndex);
            ul.prepend(li);
        }
    }

    function loadEmoticons() {
        $('#ACHtml5Player_boxEmoticons').empty();
        for (let emoticon of Emoticons) {
            let div = $('<div class="ACHtml5Player-btnEmoticons ACHtml5Player-textTooltip"></div>');
            div.attr('title', emoticon);
            div.text(emoticon);
            $('#ACHtml5Player_boxEmoticons').append(div);
        }
        loadTextToolTip();
    }

    function setBtnQuality(qualityIndex = player.getQualityIndex()) {
        if (typeof qualityIndex === 'undefined') return;
        let span = $('#ACHtml5Player_btnQuality > span');
        if (player.getAutoQualityEnabled()) span.text(`自动（${qualityName[qualityIndex]}）`);
        else span.text(qualityName[qualityIndex]);
    }

    function loadTextToolTip() {
        $('.ACHtml5Player-textTooltip').tooltipster({
            theme: 'tooltipster-acfun',
            arrow: false,
            side: 'bottom',
            debug: false
        });
    }

    function loadToolTip() {
        $('.ACHtml5Player-tooltip,.ACHtml5Player-barButtonToolTip').tooltipster({
            theme: 'tooltipster-acfun',
            arrow: false,
            side: 'top',
            debug: false
        });
    }

    function changeFullScreen() {
        $(window).scrollTop(0);
        let fullScreenType = new FormData($('#ACHtml5Player_btnFullScreen form')[0]).get('fullScreenType');
        if (fullScreenType === 'page') {
            if (Helper.getFullscreenElement() === $('#ACHtml5Player')[0]) Helper.exitFullscreen();
            else if ($('body').hasClass('ACHtml5Player-fullScreen')) {
                $('body').removeClass('ACHtml5Player-fullScreen')
                $('#ACHtml5Player_bulletScreenSendForm').prependTo('#ACHtml5Player_controlBar_bulletScreen');
            }
            else {
                $('body').addClass('ACHtml5Player-fullScreen');
                $('#ACHtml5Player_bulletScreenSendForm').prependTo('#ACHtml5Player_controlBar_control');
            }
        } else if (fullScreenType === 'desktop') {
            if (Helper.getFullscreenElement() != $('#ACHtml5Player')[0]) Helper.requestFullscreen($('#ACHtml5Player')[0]);
            else Helper.exitFullscreen();
        }
    }

    loadToolTip();
    setBtnLoopIcon();
    setBtnBulletScreenIcon();
    setRadioFullScreen();
    setVolmueAndMuted();
    loadEmoticons();
    loadBulletScreenSettings();
}

export { LoadUI }