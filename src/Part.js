import { Helper } from './lib/helper'
let $ = require('jquery');

/**
 * 非刷新 Part 切换模块
 * @param {Player} player - 播放器对象
 */
let ChangePart = (player) => {
    //v.hapame.com
    $('.part-wrap > .scroll-div > a').each((index, element) => {
        $(element).attr('data-href', $(element).attr('href'));
        $(element).removeAttr('href');
        $(element).attr('data-id', pageInfo.videoList[index].id);
    });
    $('.part-wrap > .scroll-div > *').click((e) => {
        e.stopPropagation();
        let link = $(e.target);
        link.siblings().removeClass('active');
        link.addClass('active');
        if (link.data('id') === pageInfo.videoId) return;
        history.pushState(null, null, link.data('href'));
        for (let videoInfo of pageInfo.videoList) {
            if (videoInfo.id === link.data('id')) {
                loadPart(videoInfo.index);
                break;
            }
        }
    });
    getNextPart();

    function getNextPart() {
        //创建获取下一个部分的方法
        if (pageInfo.P + 1 != pageInfo.videoList.length) {
            let netxPart = pageInfo.P + 1;
            player.setPlayNextPartFun(() => {
                activeLink(netxPart);
                loadPart(netxPart, true); //自动播放
            });
            return;
        }
        player.setPlayNextPartFun(null);
    }

    function activeLink(index) {
        let videoId = pageInfo.videoList[index].id;
        let link = $(`.part-wrap > .scroll-div > [data-id='${videoId}']`);
        if (link.length != 1) return;
        link.siblings().removeClass('active');
        link.addClass('active');
        history.pushState(null, null, link.data('href'));
    }

    function loadPart(index, autoplay = false) {
        pageInfo.P = index;
        pageInfo.videoId = pageInfo.videoList[index].id;
        player.load(pageInfo.videoId, autoplay);
        //获取播放量
        getPlayCount();
        getNextPart();
    }

    function getPlayCount() {
        $.getJSON(`http://www.acfun.cn/content_view.aspx?contentId=${pageInfo.id}`, (result) => {
            $('.view.fl > .sp2').text(Helper.separateNumber(result[0]));
        });
    }
}

export { ChangePart }