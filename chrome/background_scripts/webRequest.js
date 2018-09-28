function rewriteAllowOrignHeader(e) {
    let hasHeader = false;
    for (var header of e.responseHeaders) {
        if (header.name.toLowerCase() == "access-control-allow-origin") {
            header.value = e.initiator;
            hasHeader = true;
            break;
        }
    }
    if (!hasHeader) {
        e.responseHeaders.push({
            name: "Access-Control-Allow-Origin",
            value: e.initiator
        });
    }
    return {responseHeaders: e.responseHeaders};
}

chrome.webRequest.onHeadersReceived.addListener(
    rewriteAllowOrignHeader,
    {urls: [
        "http://player.acfun.cn/*",
        "http://video.acfun.cn/*",
    ]},
    ["blocking", "responseHeaders"]
);