function rewriteAllowOrignHeader(e) {
    let hasOriginHeader = false;
    let hasCredentialsHeader = false;
    for (var header of e.responseHeaders) {
        if (header.name.toLowerCase() == "access-control-allow-origin") {
            header.value = getOrigin(e.originUrl);
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
            value: getOrigin(e.originUrl)
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