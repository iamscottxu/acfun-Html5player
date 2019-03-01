function stopRequest(e) {
    if (
        e.url.indexOf('acfun-player/h5player') != -1
        || e.url.indexOf('/js/component/Player/h5.min.js') != -1
    ) return {cancel: true};
}

chrome.webRequest.onBeforeRequest.addListener(
    stopRequest,
    {urls: [
        "http://cdn.aixifan.com/*",
        "https://static.yximgs.com/*",
        "http://www.acfun.cn/*"
    ]},
    ["blocking"]
);