function stopRequest(e) {
    if (
        e.url.indexOf('acfun-player/h5player') != -1
        || e.url.indexOf('/js/component/Player/h5.min.js'
        || e.url.indexOf('/flash/player-view-homura.swf')) != -1
    ) return { cancel: true };
}

function rewriteAllowOrignHeader(e) {
    let hasOriginHeader = false;
    let hasCredentialsHeader = false;
    for (var header of e.responseHeaders) {
        if (header.name.toLowerCase() == "access-control-allow-origin") {
            header.value = e.initiator;
            hasOriginHeader = true;
            break;
        } else if (header.name.toLowerCase() == "access-control-allow-credentials") {
            header.value = "true";
            hasCredentialsHeader = true;
            break;
        }
    }
    if (!hasOriginHeader) {
        e.responseHeaders.push({
            name: "Access-Control-Allow-Origin",
            value: e.initiator
        });
    }
    if (!hasCredentialsHeader) {
        e.responseHeaders.push({
            name: "Access-Control-Allow-Credentials",
            value: "true"
        });
    }
    return {responseHeaders: e.responseHeaders};
}

chrome.webRequest.onBeforeRequest.addListener(
    stopRequest,
    {
        urls: [
            "http://cdn.aixifan.com/*",
            "https://static.yximgs.com/*",
            "http://www.acfun.cn/*"
        ]
    },
    ["blocking"]
);

chrome.webRequest.onHeadersReceived.addListener(
    rewriteAllowOrignHeader,
    {
        urls: [
            "http://player.acfun.cn/*",
            "http://video.acfun.cn/*"
        ]
    },
    ["blocking", "responseHeaders"]
);