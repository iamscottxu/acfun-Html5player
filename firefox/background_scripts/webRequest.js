function rewriteAllowOrignHeader(e) {
    let hasHeader = false;
    for (var header of e.responseHeaders) {
        if (header.name.toLowerCase() == "access-control-allow-origin") {
            header.value = getOrigin(e.originUrl);
            hasHeader = true;
            break;
        }
    }
    if (!hasHeader) {
        e.responseHeaders.push({
            name: "Access-Control-Allow-Origin",
            value: getOrigin(e.originUrl)
        });
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