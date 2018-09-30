$(function () {
    let reLoadACHtml5Player = function () {
        window.ACHtml5Player.dispose();
        let acvideo = $('#ACFunHtml5Player_script_acvideo').text();
        $('#ACFunHtml5Player_script_acvideo').remove();
        let ui = $('#ACFunHtml5Player_script_ui').text();
        $('#ACFunHtml5Player_script_ui').remove();
        $("script[src$='aliplayer-hls-min.js']").remove();
        $('#ACHtml5Player').empty();
        $('#ACHtml5Player').html($('#ACHtml5Player_template').text());
        loadScriptText('ui', ui);
        loadScriptText('acvideo', acvideo);
    }

    $(".cont li.play").addClass('ACFunHtml5Player_selected');

    $(".videoes > li").click(function(e) {
        if ($(this).hasClass('play')) return;
        bgmInfo.videoId = bgmInfo.list[$(this).data('index')].videos[0].videoId;
        bgmInfo.image = bgmInfo.list[$(this).data('index')].videos[0].image;
        reLoadACHtml5Player();
    });

    function loadScriptText(scriptName, script) {
        $('head').append('<script id="ACFunHtml5Player_script_' + scriptName + '">' + script + '<' + '/script' + '>');
    }
});