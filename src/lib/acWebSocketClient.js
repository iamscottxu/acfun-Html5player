import { Event } from './event'
const config = {
    serverUrl: 'ws://danmaku.acfun.cn:443',
    clientId: '2a3k3748137544',
    clientHash: '14390187'
};

class ACWebSocketClient {
    constructor(userId, userIdSHA1, udid) {
        let _event = new Event();

        _event.add('loaderror');
        _event.add('statuschanged');
        _event.add('onlineuserscountchanged');
        _event.add('newbulletscreenreceived');

        this.bind = _event.bind;
        this.unbind = _event.unbind;
        let close = false;
        let _status = 'ready';
        let _socket;
        this.connect = function (videoId, duration) {
            changeStatus('connecting');
            if (_socket == null)
                _socket = new WebSocket(`${config.serverUrl}/${videoId}`);
            _socket.onclose = function () {
                changeStatus('closed');
                _socket = null;
                if (close) {
                    close = false;
                    return;
                }
                if (this.reConnect != null) {
                    if (this.reConnect()) {
                        changeStatus('reconnecting');
                        setTimeout(this.connect, 5000);
                    }
                }
            };
            _socket.onerror = (e) => triggerLoaderrorEvent('CONNECTED_ERROR'),
                _socket.onmessage = function (evt) {
                    let data = JSON.parse(evt.data);
                    if (typeof (data.status) != "undefined") {
                        switch (parseInt(data.status)) {
                            case 202:
                                if (_status == "authenticateing") {
                                    let message = JSON.parse(data.msg);
                                    if (message.identified) {
                                        if (message.disabled) {
                                            changeStatus("connected");
                                        }
                                        else {
                                            changeStatus("connected_disabled");
                                        }
                                    }
                                    else {
                                        changeStatus("connected_notIdentified");
                                    }
                                }
                                break;
                            case 600:
                                _event.trigger('onlineuserscountchanged', { onlineUsersCount: parseInt(data.msg) });
                        }
                    } else if (data.action === 'post') _event.trigger('newbulletscreenreceived', { bulletScreenData: JSON.parse(data.command) });
                };
            _socket.onopen = function () {
                changeStatus('authenticateing');
                let authInfo = {
                    client: config.clientId,
                    client_ck: config.clientHash,
                    vid: videoId,
                    vlength: duration,
                    time: new Date().getTime(),
                    uid: userId,
                    uid_ck: userIdSHA1
                };
                sendMessane(null, 'auth', null, JSON.stringify(authInfo));
            };
        };
        this.close = function () {
            changeStatus('closeing');
            if (_socket != null) {
                close = true;
                _socket.close();
            }
        };
        this.getStatus = function () {
            return _status;
        };
        this.refreshOnlineUsersCount = function () {
            if (!getIsConnected()) return;
            sendMessane(null, 'onlanNumber', null, 'WALLE DOES NOT HAVE PENNIS');
        };
        this.sendbulletScreen = function (stime, mode, time, color, message, size) {
            if (!getIsConnected()) return;
            sendMessane('web', 'post', udid, JSON.stringify({
                user: userId,
                stime: Math.round(stime).toString(),
                mode: mode.toString(),
                time: time.toString(),
                color: color,
                message: message,
                islock: '2',
                size: size.toString()
            }));
        };
        this.getIsConnected = getIsConnected;

        function getIsConnected() {
            return _status === 'connected' || _status === 'connected_disabled' || _status === 'connected_notIdentified';
        }

        function sendMessane(platform, acthon, udid, message) {
            if (_socket == null)
                return;
            if (_socket.readyState != 1)
                return;
            let data = {
                action: acthon,
                command: message
            };
            if (typeof platform === 'string') data.platform = platform;
            if (typeof udid === 'string') data.udid = udid;
            _socket.send(JSON.stringify(data));
        }

        function changeStatus(newStatus) {
            let oldStatus = _status;
            _status = newStatus;
            _event.trigger('statuschanged', {
                oldStatus: oldStatus,
                newStatus: newStatus
            })
        }

        function triggerLoaderrorEvent(type) {
            _event.trigger('loaderror', {
                type: type,
                message: Resources[`WEBSOCKETCONNECT_${type}`].toString()
            });
        }
    }
}

export { ACWebSocketClient }