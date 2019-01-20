import { Helper } from './lib/helper'
let $ = require('jquery');

/**
 * 非刷新 Part 切换模块
 * @param {Player} player - 播放器对象
 */
let ChangePart = (player) => {
    $('.part-wrap > .scroll-div > span').click((e) => {
        e.stopPropagation();
        let span = $(e.target);
        span.siblings('span').removeClass('active');
        span.addClass('active');
        if (span.data('id') === pageInfo.videoId) return;
        history.pushState(null, null, span.data('href'));
        for (let videoInfo of pageInfo.videoList) {
            if (videoInfo.id === span.data('id')) {
                loadPart(videoInfo.index);
                break;
            }
        }
    });

    function getNextPart() {
        if (pageInfo.P + 1 === pageInfo.videoList.length) return null;
        else return pageInfo.P + 1;
    }

    function activeSpan(index) {
        let videoId = pageInfo.videoList[index].id;
        let span = $(`.part-wrap > .scroll-div > span[data-id='${videoId}']`);
        if (span.length != 1) return;
        span.siblings('span').removeClass('active');
        span.addClass('active');
        history.pushState(null, null, span.data('href'));
    }

    function loadPart(index, autoplay = false) {
        pageInfo.P = index;
        pageInfo.videoId = pageInfo.videoList[index].id;
        player.load(pageInfo.videoId, autoplay);
        //获取播放量
        getPlayCount();
        //创建获取下一个部分的方法
        let netxPart = getNextPart();
        if (netxPart === null) player.setPlayNextPartFun(null);
        else player.setPlayNextPartFun(() => {
            activeSpan(netxPart);
            loadPart(netxPart, true); //自动播放
        });
    }

    function getPlayCount() {
        $.getJSON(`http://www.acfun.cn/content_view.aspx?contentId=${pageInfo.id}`, (result) => {
            $('.view.fl > .sp2').text(Helper.separateNumber(result[0]));
        });
    }
}

export { ChangePart }