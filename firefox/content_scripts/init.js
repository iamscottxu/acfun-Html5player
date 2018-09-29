$(function () {
    let acfunH5Url = 'http://aplay-vod.cn-beijing.aliyuncs.com/acfun/h5.js';

    $('#player > .noflash-alert').hide();

    let loadScript_reloadPlayer = function() {
        loadScript('reloadPlayer');
    }
    let loadScript_acvideo = function(){
        loadScript('acvideo', loadScript_reloadPlayer);
    }
    let loadScript_ui = function(){
        loadScript('ui', loadScript_acvideo);
    };
    let loadScript_acwebsocket = function(){
        loadScript('acwebsocket', loadScript_ui);
    };
    let loadScript_tools = function(){
        loadScript('tools', loadScript_acwebsocket);
    };
    let loadScript_jquerycookie = function(){
        loadScript('jquery.cookie', loadScript_tools);
    };
    let loadScript_bulletComments_bulletComments = function(){
        loadScript('bulletComments/bulletComments', loadScript_jquerycookie);
    };
    let loadScript_bulletComments_lib_uuid = function(){
        loadScript('bulletComments/lib/uuid', loadScript_bulletComments_bulletComments);
    };
    let loadScript_bulletComments_lib_linkedList = function(){
        loadScript('bulletComments/lib/linkedList', loadScript_bulletComments_lib_uuid);
    };
    let getScript_acfunH5 = function(){
        $.getScript(acfunH5Url, loadScript_bulletComments_lib_linkedList);
    };

    let loadHtml_ACHtml5Player = function(){
        loadHtml('ACHtml5Player', function(element){
            $('#ACFlashPlayer').after('<div id="ACHtml5Player" class="ACHtml5Player" tabindex = "0">'); //添加Html播放器容器
            $('body').after('<div id="ACHtml5Player_template" style="display:none;">'); //添加Html播放器容器
            $('#ACFlashPlayer').remove();  //删除flash播放器
            $('#ACHtml5Player').html(element);(
            $('#ACHtml5Player_template').text(element));
            getScript_acfunH5();
        });
    };

    loadStyle('ACHtml5Player');
    loadStyle('resource');
    loadHtml_ACHtml5Player();

    function loadScript(scriptName, success) {
        let url = browser.extension.getURL('scripts/' + scriptName + '.js');
        $.get(url, function (result) {
            let id = scriptName.replace(/\//g, '-').replace(/\./g, '_');
            $('head').append('<script id="ACFunHtml5Player_script_' + id + '">' + result + '</script>');
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
        let url = browser.extension.getURL('html/' + htmlName + '.html');
        $.get(url, function (result) {
            if (success) success(result);
        }, 'html');
    }
});