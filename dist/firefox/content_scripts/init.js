$(function () {
    $('#player > .noflash-alert').hide();

    loadStyle_acfun_html5player = function () {
        loadStyle('acfun-html5player.all.min');
    }

    let loadScript_acfun_html5player = function () {
        loadScript('acfun-html5player.all.min');
    };

    let loadHtml_ACHtml5Player = function () {
        loadHtml('acfun-html5player', function (element) {
            $('#ACFlashPlayer').after(element); //添加Html播放器容器
            $('#ACFlashPlayer').remove();  //删除flash播放器
            loadScript_acfun_html5player();
        });
    };

    loadStyle_acfun_html5player();
    loadHtml_ACHtml5Player();

    function loadScript(scriptName, success) {
        let url = browser.extension.getURL('scripts/' + scriptName + '.js');
        $.get(url, function (result) {
            $('head').append('<script>' + result + '</script>');
            if (success) success();
        }, 'text');
    }

    function loadStyle(styleName, success) {
        let url = browser.extension.getURL('styles/' + styleName + '.css');
        $.get(url, function (result) {
            $('head').append('<style>' + result + '</style>');
            if (success) success();
        }, 'text');
    }

    function loadHtml(htmlName, success) {
        let url = browser.extension.getURL('htmls/' + htmlName + '.html');
        $.get(url, function (result) {
            if (success) success($(result));
        }, 'html');
    }
});