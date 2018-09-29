$(function () {
    window.ACHtml5Player.ui = {
        elements: {
            loadingShadeDiv: $('#ACHtml5Player_loadingShade'),
            loadingCoverDiv: $('#ACHtml5Player_loadingCover'),
            ACHtml5PlayerDiv: $('#ACHtml5Player'),
            mainDiv: $('#ACHtml5Player_main'),
            bulletCommentsListTable: $('#ACHtml5Player_bulletCommentsList'),
            playerDiv: $('#ACHtml5Player_player'),
            bulletCommentsDiv: $('#ACHtml5Player_bulletComments'),
            bulletCommentsEmptyDiv: $('#ACHtml5Player_bulletCommentsEmpty'),
            acfunPlayPauseAnimateDiv: $('#ACHtml5Player_acfunPlayPauseAnimate'),
            btnPlayPauseDiv: $('#ACHtml5Player_btnPlayPause'),
            textTimeDiv: $('#ACHtml5Player_textTime'),
            btnLoopDiv: $('#ACHtml5Player_btnLoop'),
            btnBulletCommentsDiv: $('#ACHtml5Player_btnBulletComments'),
            btnVolumeDiv: $('#ACHtml5Player_btnVolume'),
            btnQualityDiv: $('#ACHtml5Player_btnQuality'),
            btnFullScreenDiv: $('#ACHtml5Player_btnFullScreen'),
            qualityListDiv: $('#ACHtml5Player_qualityList'),
            progressBarCompleteDiv: $('#ACHtml5Player_progressBarComplete'),
            progressBarBufferDiv: $('#ACHtml5Player_progressBarBuffer'),
            progressBarDiv: $('#ACHtml5Player_progressBar'),
            progressBarHandShankDiv: $('#ACHtml5Player_progressBarHandShank'),
            progressBarTipDiv: $('#ACHtml5Player_progressBarTip'),
            onlineUsersCountDiv: $('#ACHtml5Player_onlineUsersCount'),
            volumeNumberDiv: $('#ACHtml5Player_volumeNumber'),
            volumeSlideBarFillDiv: $('#ACHtml5Player_volumeSlideBarFill'),
            volumeSlideBarDiv: $('#ACHtml5Player_volumeSlideBar'),
            checkBoxFullScreenPageDiv: $('#ACHtml5Player_checkBoxFullScreenPage'),
            checkBoxFullScreenDesktopDiv: $('#ACHtml5Player_checkBoxFullScreenDesktop'),
            controlBarsDiv: $('#ACHtml5Player_controlBars'),
            foldBarDiv: $('#ACHtml5Player_foldBar'),
            bulletCommentInput: $('#ACHtml5Player_bulletCommentInput'),
            btnBulletCommentSendDiv: $('#ACHtml5Player_btnBulletCommentSend')
        },
        event: {
            onmouseup: null,
            onslidebarmousedown: null,
            onslidebarmousemove: null,
            onslidebarclick: null,

            oncheckboxchange: null
        },
        setloadingCoverImg: function (url) {
            window.ACHtml5Player.ui.elements.loadingCoverDiv.css('background-image', 'url(' + url + ')');
        },
        hideLoadingShade: function () {
            window.ACHtml5Player.ui.elements.loadingShadeDiv.css('display', 'none');
        },
        getQualityNameByQuality: function (index) {
            let qualityName = '未知';
            switch (index) {
                case '0':
                    qualityName = '流畅';
                    break;
                case '1':
                    qualityName = '高清';
                    break;
                case '2':
                    qualityName = '超清';
                    break;
                case '3':
                    qualityName = '原画';
                    break;
            }
            return qualityName;
        },
        setQualityText: function (selectQuality) {
            let qualityDivs = window.ACHtml5Player.ui.elements.qualityListDiv.children();
            qualityDivs.removeClass('select');
            let selectQualityDiv = qualityDivs.filter("[data-name='" + selectQuality + "']");
            selectQualityDiv.addClass('select');
            let qualityName = ACHtml5Player.ui.getQualityNameByQuality(selectQualityDiv.data('index') + '');
            ACHtml5Player.ui.elements.btnQualityDiv.find('span').text(qualityName);
        },
        addQualityToList: function (qualitys, selectQuality) {
            window.ACHtml5Player.ui.elements.qualityListDiv.html('');
            for (let index in qualitys) {
                let li = $('<li></li>');
                li.text(window.ACHtml5Player.ui.getQualityNameByQuality(index));
                li.attr('data-name', qualitys[index]);
                li.attr('data-index', index);
                window.ACHtml5Player.ui.elements.qualityListDiv.prepend(li);
            }
            window.ACHtml5Player.ui.setQualityText(selectQuality);
        },
        setSlideBarValue: function (elements, progress) {
            if (elements.parent().hasClass('horizontal')) {
                elements.css('width', progress * 100 + '%');
            } else if (elements.parent().hasClass('vertical')) {
                elements.css('height', progress * 100 + '%');
            }
        },
        getSlideBarValue: function (elements) {
            if (elements.parent().hasClass('horizontal')) {
                return elements.width() / elements.parent().width();
            } else if (elements.parent().hasClass('vertical')) {
                return elements.height() / elements.parent().height();
            }
        },
        setCheckBox: function (elements, check) {
            if (check) {
                elements.removeClass('ACHtml5Player-resource-checkBox');
                elements.addClass('ACHtml5Player-resource-checkBoxChecked');
            } else {
                elements.removeClass('ACHtml5Player-resource-checkBoxChecked');
                elements.addClass('ACHtml5Player-resource-checkBox');
            }
        },
        getCheckBox: function (elements) {
            return elements.hasClass('ACHtml5Player-resource-checkBoxChecked');
        },
        setVolumeNumber: function (number) {
            ACHtml5Player.ui.setSlideBarValue(
                ACHtml5Player.ui.elements.volumeSlideBarFillDiv,
                number
            );
        },
        getVolumeNumber: function () {
            return ACHtml5Player.ui.getSlideBarValue(
                ACHtml5Player.ui.elements.volumeSlideBarFillDiv
            );
        },
        setProgressComplete: function (progress) {
            ACHtml5Player.ui.setSlideBarValue(
                ACHtml5Player.ui.elements.progressBarCompleteDiv,
                progress
            );
        },
        getProgressComplete: function () {
            return ACHtml5Player.ui.getSlideBarValue(
                ACHtml5Player.ui.elements.progressBarCompleteDiv
            );
        },
        setProgressBuffer: function (progress) {
            ACHtml5Player.ui.setSlideBarValue(
                ACHtml5Player.ui.elements.progressBarBufferDiv,
                progress
            );
        },
        setFullScreen: function (fullScreen) {
            if (fullScreen) {
                $('body').addClass('ACHtml5Player-fullScreen');
            } else {
                $('body').removeClass('ACHtml5Player-fullScreen');
            }
        },
        setFullScreenDesktop: function (fullScreen) {
            if (fullScreen) {
                ACHtml5Player.ui.elements.progressBarDiv.prependTo(ACHtml5Player.ui.elements.controlBarsDiv);
                $('body').addClass('ACHtml5Player-fullScreen-desktop');
            } else {
                ACHtml5Player.ui.elements.progressBarDiv.appendTo(ACHtml5Player.ui.elements.mainDiv);
                $('body').removeClass('ACHtml5Player-fullScreen-desktop');
            }
        },
        getFullScreen: function () {
            return $('body').hasClass('ACHtml5Player-fullScreen');
        },
        getFullScreenDesktop: function () {
            return $('body').hasClass('ACHtml5Player-fullScreen-desktop');
        },
        changeControlBarsVisibility: function (visibility) {
            if (visibility) {
                ACHtml5Player.ui.elements.ACHtml5PlayerDiv.css('cursor', 'default');
                ACHtml5Player.ui.elements.controlBarsDiv.css('opacity', '1');
            } else {
                ACHtml5Player.ui.elements.ACHtml5PlayerDiv.css('cursor', 'none');
                ACHtml5Player.ui.elements.controlBarsDiv.css('opacity', '0');
            }
        },
        changeBtnVolumeIcon: function (muteOnOrOff) {
            if (muteOnOrOff) {
                ACHtml5Player.ui.elements.btnVolumeDiv.removeClass('ACHtml5Player-resource-volume');
                ACHtml5Player.ui.elements.btnVolumeDiv.addClass('ACHtml5Player-resource-mute');
            } else {
                ACHtml5Player.ui.elements.btnVolumeDiv.removeClass('ACHtml5Player-resource-mute');
                ACHtml5Player.ui.elements.btnVolumeDiv.addClass('ACHtml5Player-resource-volume');
            }
        },
        changeBtnBulletCommentsIcon: function (bulletCommentsOnOrOff) {
            if (bulletCommentsOnOrOff) {
                ACHtml5Player.ui.elements.btnBulletCommentsDiv.removeClass('ACHtml5Player-resource-bulletCommentsOff');
                ACHtml5Player.ui.elements.btnBulletCommentsDiv.addClass('ACHtml5Player-resource-bulletCommentsOn');
            } else {
                ACHtml5Player.ui.elements.btnBulletCommentsDiv.removeClass('ACHtml5Player-resource-bulletCommentsOn');
                ACHtml5Player.ui.elements.btnBulletCommentsDiv.addClass('ACHtml5Player-resource-bulletCommentsOff');
            }
        },
        changeBtnLoopIcon: function (loopOnOrOff) {
            if (loopOnOrOff) {
                ACHtml5Player.ui.elements.btnLoopDiv.removeClass('ACHtml5Player-resource-loopOff');
                ACHtml5Player.ui.elements.btnLoopDiv.addClass('ACHtml5Player-resource-loopOn');
            } else {
                ACHtml5Player.ui.elements.btnLoopDiv.removeClass('ACHtml5Player-resource-loopOn');
                ACHtml5Player.ui.elements.btnLoopDiv.addClass('ACHtml5Player-resource-loopOff');
            }
        },
        changeBtnPlayPauseIcon: function (playOrPause) {
            if (playOrPause) {
                ACHtml5Player.ui.elements.btnPlayPauseDiv.removeClass('ACHtml5Player-resource-pause');
                ACHtml5Player.ui.elements.btnPlayPauseDiv.addClass('ACHtml5Player-resource-play');
            } else {
                ACHtml5Player.ui.elements.btnPlayPauseDiv.removeClass('ACHtml5Player-resource-play');
                ACHtml5Player.ui.elements.btnPlayPauseDiv.addClass('ACHtml5Player-resource-pause');
            }
        },
        changeFold: function (elements) {
            let parentElement = elements.parent().parent();
            if (parentElement.hasClass('fold')) parentElement.removeClass('fold');
            else parentElement.addClass('fold');
        },
        playOrPauseAnimate: function (playOrPause) {
            if (playOrPause) {
                ACHtml5Player.ui.elements.acfunPlayPauseAnimateDiv.animate({
                    height: '100px',
                    width: '466px',
                    right: '-86.5px',
                    bottom: '5px',
                    opacity: '0'
                }, 620, 'linear', function () {
                    ACHtml5Player.ui.elements.acfunPlayPauseAnimateDiv.css('display', 'none');
                });
            } else {
                ACHtml5Player.ui.elements.acfunPlayPauseAnimateDiv.css('display', 'block');
                ACHtml5Player.ui.elements.acfunPlayPauseAnimateDiv.animate({
                    height: '50px',
                    width: '233px',
                    right: '30px',
                    bottom: '30px',
                    opacity: '1'
                }, 620, 'linear');
            }
        },
        disabeBulletCommentSendBtn: function() {
            let btnBulletCommentSendDiv = ACHtml5Player.ui.elements.btnBulletCommentSendDiv;
            if (typeof(btnBulletCommentSendDiv[0].countdown) === 'undefined') btnBulletCommentSendDiv[0].countdown = 4;
            if (btnBulletCommentSendDiv[0].countdown < 4) return false;
            btnBulletCommentSendDiv[0].countdown = 3;
            btnBulletCommentSendDiv.addClass('disable');            
            let enableBulletCommentSendBtn = function() {
                if (btnBulletCommentSendDiv[0].countdown > 0){
                    btnBulletCommentSendDiv.text('发送(' + btnBulletCommentSendDiv[0].countdown + ')');
                    btnBulletCommentSendDiv[0].countdown--;
                    setTimeout(enableBulletCommentSendBtn, 1000);
                } else {
                    btnBulletCommentSendDiv[0].countdown = 4;
                    btnBulletCommentSendDiv.text('发送');
                    btnBulletCommentSendDiv.removeClass('disable');
                }
            }
            enableBulletCommentSendBtn();
            return true;
        }
    };

    ACHtml5Player.ui.drag = null;
    $('.ACHtml5Player-slideBar').click(function (e) {
        if ($(e.target).hasClass('ACHtml5Player-slideBarHandShank')) return;
        let number;
        if ($(this).hasClass('horizontal')) {
            let x = e.pageX - $(this).offset().left;
            number = x / $(this).width();
        } else if ($(this).hasClass('vertical')) {
            let y = e.pageY - $(this).offset().top;
            number = 1 - y / $(this).height();
        }
        let slideBarFillDiv = $(this).find('.ACHtml5Player-slideBarFill');
        ACHtml5Player.ui.setSlideBarValue(slideBarFillDiv, number);
        if (ACHtml5Player.ui.event.onslidebarclick != null)
            ACHtml5Player.ui.event.onslidebarclick($(this), number);
    })
    $('.ACHtml5Player-slideBar .ACHtml5Player-slideBarHandShank').on({
        mousedown: function (e) {
            let slideBarDiv = $(this).parents('.ACHtml5Player-slideBar');
            ACHtml5Player.ui.drag = slideBarDiv[0];
            if (ACHtml5Player.ui.event.onslidebarmousedown != null)
                ACHtml5Player.ui.event.onslidebarmousedown(slideBarDiv);
        },
        mousemove: function (e) {
            let slideBarDiv = $(this).parents('.ACHtml5Player-slideBar');
            if (ACHtml5Player.ui.drag != slideBarDiv[0]) return;
            let number;
            if (slideBarDiv.hasClass('horizontal')) {
                let width = slideBarDiv.width();
                let x = e.pageX - slideBarDiv.offset().left;
                if (x < 0 || x > width) return;
                number = x / width;
            } else if (slideBarDiv.hasClass('vertical')) {
                let height = slideBarDiv.height();
                let y = e.pageY - slideBarDiv.offset().top;
                if (y < 0 || y > height) return;
                number = 1 - y / height;
            }
            ACHtml5Player.ui.setSlideBarValue($(this).parent('.ACHtml5Player-slideBarFill'), number);
            if (ACHtml5Player.ui.event.onslidebarmousemove != null)
                ACHtml5Player.ui.event.onslidebarmousemove(slideBarDiv, number);
        }
    });
    $(window).on('mouseup', function () {
        if (ACHtml5Player.ui.drag == null) return;
        if (ACHtml5Player.ui.event.onmouseup != null)
            ACHtml5Player.ui.event.onmouseup($(ACHtml5Player.ui.drag));
        ACHtml5Player.ui.drag = null;
    });

    $('.ACHtml5Player-checkBox').click(function () {
        let checked = !window.ACHtml5Player.ui.getCheckBox($(this));
        let cancel = false;
        if (window.ACHtml5Player.ui.event.oncheckboxchange != null)
            cancel = !window.ACHtml5Player.ui.event.oncheckboxchange($(this), checked);
        if (cancel) return;
        window.ACHtml5Player.ui.setCheckBox($(this), checked);
    });

    $('.ACHtml5Player-foldBar').click(function () {
        window.ACHtml5Player.ui.changeFold($(this));
    });

    $('.ACHtml5Player-barButton').click(function (e) {
        if (e.target != this) return;
        let clickPopupBoxDiv = $(this).find('.ACHtml5Player-clickPopupBox');
        if (clickPopupBoxDiv.length != 1) return;
        if (clickPopupBoxDiv.css('display') == 'none') {
            $('.ACHtml5Player-clickPopupBox').hide(0);
            clickPopupBoxDiv.show();
        } else clickPopupBoxDiv.hide(0);
    });

    $('.ACHtml5Player-clickPopupBox').mouseout(function (e) {
        if (e.target != this) return;
        $(this).delay(500).hide(0);
    });

    $('.ACHtml5Player-clickPopupBox').mouseenter(function (e) {
        $(this).clearQueue();
    });
});