$(function () {
    let acfunH5Url = 'http://aplay-vod.cn-beijing.aliyuncs.com/acfun/h5.js';

    let loadScript_acvideo = function(){
        loadScript('acvideo');
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
            $('#ACFlashPlayer').after(element); //添加Html播放器容器
            $('#ACFlashPlayer').remove();  //删除flash播放器
            getScript_acfunH5();
        });
    };

    loadStyle('ACHtml5Player');
    loadStyle('resource');
    loadHtml_ACHtml5Player();

    function loadScript(scriptName, success) {
        let url = msBrowser.extension.getURL('scripts/' + scriptName + '.js');
        $.get(url, function (result) {
            $('head').append('<script>' + result + '</script>');
            if (success) success();
        }, 'text');
    }

    function loadStyle(styleName, success) {
        let url = msBrowser.extension.getURL('styles/' + styleName + '.css');
        $.get(url, function (result) {
            $('head').append('<style>' + result + '</style>');
            if (success) success();
        }, 'text');
    }

    function loadHtml(htmlName, success) {
        let url = msBrowser.extension.getURL('html/' + htmlName + '.html');
        $.get(url, function (result) {
            if (success) success($(result));
        }, 'html');
    }
});