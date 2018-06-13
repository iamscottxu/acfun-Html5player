function rewriteAllowOrignHeader(e) {
    for (var header of e.responseHeaders) {
        if (header.name.toLowerCase() == "access-control-allow-origin") {
            header.value = getOrigin(e.originUrl);
            break;
        }
    }
    return {responseHeaders: e.responseHeaders};
}

function getOrigin(url){
    return /^[a-zA-Z]+:[/][/][a-zA-Z.]*/.exec(url)[0]; 
}

chrome.webRequest.onHeadersReceived.addListener(
    rewriteAllowOrignHeader,
    {urls: [
        "http://player.acfun.cn/*",
        "http://video.acfun.cn/*",
    ]},
    ["blocking", "responseHeaders"]
);