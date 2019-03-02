let $ = require('jquery');

/**
 * Bangumi 切换模块
 * @param {Player} player - 播放器对象
 */
let ChangeBangumi = (player) => {
    let _autoPlay = false;
    window.useH5Player = (info) => {
        $('#ACHtml5Player_loadingCover').css('background-image', `url(${info.backgroundUrl})`);
        loadBangumi(info.sourceId, _autoPlay);
        _autoPlay = false;
    }
    setNextBangumi(pageInfo.video.videos[0].videoId);

    function setNextBangumi(id) {
        //创建获取下一个部分的方法
        if ($(`.aa-info > .container > .cont li[data-vid='${id}']`).next('li').length === 0) player.setPlayNextPartFun(null);
        else player.setPlayNextPartFun(() => {
            $(`.aa-info > .container > .cont li[data-vid='${id}']`).each(function () {
                if ($(this).parent().hasClass('hidden')) return true;
                _autoPlay = true;
                $(this).next('li').click();
                return false;
            });
        });
    }

    function loadBangumi(id, autoPlay) {
        player.load(id, autoPlay);
        setNextBangumi(id);
    }
}

export { ChangeBangumi }