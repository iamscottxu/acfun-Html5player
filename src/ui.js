import { Helper } from './lib/helper'
import { SlideBar } from './lib/slideBar'
import Emoticons from './emoticons.json'
import PerfectScrollbar from 'perfect-scrollbar'
import { setInterval } from 'core-js';

let $ = require('jquery');
$ = require('tooltipster');

const qualityName = [
    '标清',
    '高清',
    '超清',
    '1080p'
]

let LoadUI = (player, coverImage) => {

    $('#ACHtml5Player_loadingCover').css('background-image', `url(${coverImage})`);

    const bulletScreenScrollbar = new PerfectScrollbar('.ACHtml5Player-bulletScreenScrolly', {
        suppressScrollX: true
    });

    const boxEmoticonsScrollbar = new PerfectScrollbar('.ACHtml5Player-boxEmoticonsScrolly', {
        suppressScrollX: true
    });

    const volumeSlideBar = new SlideBar('#ACHtml5Player_volumeSlideBarBox', true, true);

    player.bind('loadsuccess', () => {
        loadQualityList();
        setBtnQuality();
    });

    player.bind('bulletScreenDestroy', () => {
        $('#ACHtml5Player_bulletScreenList').empty();
        $('#ACHtml5Player_bulletScreenEmpty').show();
    });

    player.bind('adapterDestroy', () => {
        $('#ACHtml5Player_loadingShade').show();
    });

    player.bind('loadedmetadata', () => {
        $('#ACHtml5Player_loadingShade').hide();
        $('#ACHtml5Player_acfunPlayPauseAnimate').addClass('ACHtml5Player_acfunPlayPauseAnimate_show');
    });

    player.bind('play', () => {
        $('#ACHtml5Player_btnPlayPause').removeClass('ACHtml5Player-resource-play');
        $('#ACHtml5Player_btnPlayPause').addClass('ACHtml5Player-resource-pause');
        $('#ACHtml5Player_acfunPlayPauseAnimate').removeClass('ACHtml5Player_acfunPlayPauseAnimate_show');
        $('#ACHtml5Player_acfunPlayPauseAnimate').addClass('ACHtml5Player_acfunPlayPauseAnimate_hide');
    });

    let _pauseEvent = () => {
        $('#ACHtml5Player_btnPlayPause').removeClass('ACHtml5Player-resource-pause');
        $('#ACHtml5Player_btnPlayPause').addClass('ACHtml5Player-resource-play');
        $('#ACHtml5Player_acfunPlayPauseAnimate').removeClass('ACHtml5Player_acfunPlayPauseAnimate_hide');
        $('#ACHtml5Player_acfunPlayPauseAnimate').addClass('ACHtml5Player_acfunPlayPauseAnimate_show');
    }

    player.bind('emptied', _pauseEvent);

    player.bind('pause', _pauseEvent);

    player.bind('currentTimeChanged', (e) => {
        $('#ACHtml5Player_textCurrentTime').text(e.currentTimeText);
        $('#ACHtml5Player_textDuration').text(e.durationText);
        $('#ACHtml5Player_progressBarBuffer').css('width', `${e.bufferPercent}%`);
        if (progressMousedown) return;
        $('#ACHtml5Player_progressBarComplete').css('width', `${e.percent}%`);
    });

    player.bind('bulletScreenCountChanged', (e) => {
        $('.danmu.fl > .sp2').text(e.bulletScreenCountText);
        $('#ACHtml5Player_bulletScreenCount').text(e.bulletScreenCountText);
    });

    player.bind('qualitySwitching', (e) => {
        setBtnQuality(e.qualityIndex);
    });

    player.bind('qualitySwitched', (e) => {
        setBtnQuality(e.qualityIndex);
    });

    player.bind('addBulletScreens', (e) => {
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
        $('#ACHtml5Player_btnSpeed > span').text(e.playbackRate === 1 ? '倍数' : `${e.playbackRate}倍`);
    });

    volumeSlideBar.bind('valuechanged', (e) => {
        $('#ACHtml5Player_volumeNumber').text(parseInt(e.value * 100));
    });

    volumeSlideBar.bind('valuechangedbyui', (e) => {
        player.setVolume(e.value);
    });

    $('#ACHtml5Player_btnVolume').click(function(e) {
        if (e.target != this) return;
        player.setMuted(!player.getMuted());
    });

    $('#ACHtml5Player_bulletScreenList').click((e) => {
        if (e.target.tagName.toLowerCase() === 'th') player.setCurrentTime(parseFloat($(e.target).parent('tr').data('starttime')));
    });

    $('#ACHtml5Player_acfunPlayPauseAnimate').click((e) => {
        if ($(e.target).hasClass('ACHtml5Player_acfunPlayPauseAnimate_show')) player.changePlayState();
    });

    $('#ACHtml5Player_btnPlayPause').click(() => {
        player.changePlayState();
    });

    //区分单击和双击事件
    let bulletScreensClickTimer = null;
    $('#ACHtml5Player_bulletScreens').click(() => {
        clearTimeout(bulletScreensClickTimer);
        bulletScreensClickTimer = setTimeout(player.changePlayState, 500);
    });

    $('#ACHtml5Player_bulletScreens').dblclick(() => {
        clearTimeout(bulletScreensClickTimer);
        changeFullScreen();
    });

    $('#ACHtml5Player_btnBulletScreen').click(() => {
        player.changeBulletScreenVisibility();
        setBtnBulletScreenIcon();
    });

    $('#ACHtml5Player_btnLoop').click(() => {
        player.setLoop(!player.getLoop());
        setBtnLoopIcon();
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
            let input = $('#ACHtml5Player_bulletScreenInput');
            input.val(input.val() + $(e.target).text());
        }
    });

    $('#ACHtml5Player_foldBar').click(() => {
        if ($('#ACHtml5Player').hasClass('fold')) $('#ACHtml5Player').removeClass('fold');
        else $('#ACHtml5Player').addClass('fold');
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
    $('#ACHtml5Player_progressBarHandShank').mousedown((e) => { progressMousedown = true; progressMousedownLastEvent = e;});

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
            if (fullScreenType === 'desktop') $('body').removeClass('ACHtml5Player-fullScreen');
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
        let fullScreenType = new FormData($('#ACHtml5Player_btnFullScreen form')[0]).get('fullScreenType');
        if (fullScreenType === 'page') {
            if (Helper.getFullscreenElement() === $('#ACHtml5Player')[0]) Helper.exitFullscreen();
            else if ($('body').hasClass('ACHtml5Player-fullScreen')) $('body').removeClass('ACHtml5Player-fullScreen');
            else $('body').addClass('ACHtml5Player-fullScreen');
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
}

export { LoadUI }