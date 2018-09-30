$(function () {
    window.ACHtml5Player.webSocketClient = function (videoId, videoLength, userId, userIdSHA1, udid) {
        let _this = this;
        let config = {
            serverUrl: 'ws://danmaku.acfun.cn:443',
            clientId: '2a3k3748137544',
            clientHash: '14390187'
        };
        this.onReConnect = null;
        this.onError = null;
        this.onConnected = null;
        
        let close = false;
        let status = 'ready';
        let socket;
        this.connect = function () {
            status = 'connecting';
            if (socket == null) socket = new WebSocket(config.serverUrl + '/' + videoId);
            socket.onclose = function () {
                status = 'close';
                socket = null;
                if (close) {
                    close = false;
                    return;
                }
                if (this.reConnect != null) {
                    if (this.reConnect()) {
                        status = 'reconnecting';
                        setTimeout(this.connect, 5000);
                    }
                }
            };
            socket.onerror = this.onError;
            socket.onmessage = function (evt) {
                let data = JSON.parse(evt.data);
                if (typeof (data.status) != "undefined") {
                    switch (parseInt(data.status)) {
                        case 202:
                            if (status == "authenticateing") {
                                let message = JSON.parse(data.msg);
                                if (message.identified) {
                                    if (message.disabled) {
                                        status = "connected";
                                    } else {
                                        status = "connected_disabled";
                                    }
                                } else {
                                    status = "connected_notIdentified";
                                }
                                if (_this.onConnected != null) _this.onConnected();
                            }
                            break;
                        case 600:
                            if (_this.onOnlineUsersCountChange != null) _this.onOnlineUsersCountChange(parseInt(data.msg));
                            break;
                    }
                }
            }
            socket.onopen = function () {
                status = 'authenticateing';
                let authInfo = {
                    client: config.clientId,
                    client_ck: config.clientHash,
                    vid: videoId,
                    vlength: videoLength,
                    time: new Date().getTime(),
                    uid: userId,
                    uid_ck: userIdSHA1
                }
                sendMessane(null, 'auth', null, JSON.stringify(authInfo));
            }
        };
        this.close = function () {
            status = 'closeing';
            if (socket != null) {
                close = true;
                socket.close();
            }
        };
        this.getStatus = function () {
            return status;
        }

        this.refreshOnlineUsersCount = function () {
            if (status != 'connected' && 
                status != 'connected_disabled' &&
                status != 'connected_notIdentified')  return;
            sendMessane(null, 'onlanNumber', null, 'WALLE DOES NOT HAVE PENNIS');
        }

        this.sendbulletComment = function (stime, mode, time, color, message, size) {
            if (status != 'connected' && 
                status != 'connected_disabled' &&
                status != 'connected_notIdentified')  return;
            let command = {
                user: userId,
                stime: Math.round(stime) + '',
                mode: mode + '',
                time: time + '',
                color: color + '',
                message: message,
                islock: '2',
                size: size + ''
            }
            sendMessane('web', 'post', udid, JSON.stringify(command));
        }

        this.onOnlineUsersCountChange = null;

        this.onNewBulletCommentReceive = null;

        function sendMessane(platform, acthon, udid, message) {
            if (socket == null) return;
            if (socket.readyState != 1) return;
            let data = {
                platform: platform,
                action: acthon,
                udid: udid,
                command: message
            }
            socket.send(JSON.stringify(data));
        }
    };
});