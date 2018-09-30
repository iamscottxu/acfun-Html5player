$(function () {
    window.ACHtml5Player.tools = {
        format_number: function (n) {
            var b = parseInt(n).toString();
            var len = b.length;
            if (len <= 3) { return b; }
            var r = len % 3;
            return r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") : b.slice(r, len).match(/\d{3}/g).join(",");
        },
        PrefixInteger: function (num, length) {
            return (Array(length).join('0') + num).slice(-length);
        },
        launchFullscreen: function (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        },
        exitFullscreen: function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        },
        fullscreenchangeEventListenerFunction: null,
        addScreenchangeEventListener: function (fn) {
            if (window.ACHtml5Player.tools.fullscreenchangeEventListenerFunction != null) return;
            window.ACHtml5Player.tools.fullscreenchangeEventListenerFunction = fn;
            $(document).on("fullscreenchange mozfullscreenchange webkitfullscreenchange msfullscreenchange", fn);
        },
        removeScreenchangeEventListener: function () {
            if (window.ACHtml5Player.tools.fullscreenchangeEventListenerFunction == null) return;
            let fn = window.ACHtml5Player.tools.fullscreenchangeEventListenerFunction;
            $(document).off("fullscreenchange mozfullscreenchange webkitfullscreenchange msfullscreenchange", fn);
            window.ACHtml5Player.tools.fullscreenchangeEventListenerFunction = null;
        }
    }
});