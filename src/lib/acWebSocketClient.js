import { Event } from './event'
import { Resources } from './resources'
const config = {
    serverUrl: 'ws://danmaku.acfun.cn:443',
    danmakuTokenUrl: 'http://www.acfun.cn/rest/pc-direct/passport/getBarrageToken',
    clientId: '2a3k3748137544',
    clientHash: '14390187'
};

class ACWebSocketClient {
    constructor(userId, userIdSHA1, udid) {
        let _event = new Event();

        _event.add('loaderror');
        _event.add('error');
        _event.add('statuschanged');
        _event.add('onlineuserscountchanged');
        _event.add('newbulletscreenreceived');

        this.bind = _event.bind;
        this.unbind = _event.unbind;
        let close = false;
        let _status = 'ready';
        let _socket;
        let _reConnectTimeout = null;
        let _heartbeatTimeout = null;
        let connect = (videoId, duration) => {
            _reConnectTimeout = null;
            changeStatus('connecting');
            if (_socket == null)
                _socket = new WebSocket(`${config.serverUrl}/${videoId}`);
            _socket.onerror = (e) => {
                triggerLoaderrorEvent('CONNECTED_ERROR');
                if (_reConnectTimeout === null) {
                    changeStatus('reconnecting');
                    _reConnectTimeout = setTimeout(() => connect(videoId, duration), 5000);
                }
            }
            _socket.onclose = function () {
                _socket = null;
                if (close) {
                    close = false;
                    changeStatus('closed');
                    return;
                }
                if (_reConnectTimeout === null) {
                    changeStatus('reconnecting');
                    _reConnectTimeout = setTimeout(() => connect(videoId, duration), 5000);
                }
                triggerErrorEvent('ACCIDENTAL_CUTTING');
            }
            _socket.onmessage = function (evt) {
                clearTimeout(_heartbeatTimeout);
                let data = JSON.parse(evt.data);
                if (typeof (data.status) != "undefined") {
                    switch (parseInt(data.status)) {
                        case 202:
                            refreshOnlineUsersCount();
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
                            setTimeout(refreshOnlineUsersCount, 10000);
                            _event.trigger('onlineuserscountchanged', { onlineUsersCount: parseInt(data.msg) });
                            break;
                    }
                } else if (data.action === 'post') _event.trigger('newbulletscreenreceived', { bulletScreenData: JSON.parse(data.command) });
            };
            _socket.onopen = function () {
                changeStatus('authenticateing');
                $.getJSON(config.danmakuTokenUrl, (data) => {
                    let authInfo = {
                        client: config.clientId,
                        client_ck: config.clientHash,
                        vid: videoId,
                        vlength: duration,
                        time: new Date().getTime(),
                        uid: userId,
                        uid_ck: userIdSHA1,
                        danmakuToken: data.acBarrageToken
                    };
                    sendMessane(null, 'auth', null, JSON.stringify(authInfo));
                });
            };
        };
        this.connect = connect;
        this.close = function () {
            changeStatus('closeing');
            if (_reConnectTimeout != null) {
                clearTimeout(_reConnectTimeout);
                _reConnectTimeout = null;
            }
            if (_heartbeatTimeout != null) {
                clearTimeout(_heartbeatTimeout);
                _heartbeatTimeout = null;
            }
            if (_socket != null) {
                close = true;
                _socket.close();
            }
        };
        this.getStatus = function () {
            return _status;
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

        function refreshOnlineUsersCount() {
            if (_socket === null || _socket.readyState != 1) return;
            sendMessane(null, 'onlanNumber', null, 'WALLE DOES NOT HAVE PENNIS');
            _heartbeatTimeout = setTimeout(() => {
                changeStatus('closeing');
                _socket.close();
                triggerErrorEvent('ACCIDENTAL_CUTTING');
            }, 5000);
        }

        function getIsConnected() {
            return _status === 'connected' || _status === 'connected_disabled' || _status === 'connected_notIdentified';
        }

        function sendMessane(platform, acthon, udid, message) {
            if (_socket === null || _socket.readyState != 1) return;
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
            let fullType = `WEBSOCKETCONNECT_${type}`;
            _event.trigger('loaderror', {
                errorType: fullType,
                message: Resources[fullType].toString()
            });
        }

        function triggerErrorEvent(type) {
            let fullType = `WEBSOCKETCONNECT_${type}`;
            _event.trigger('error', {
                errorType: fullType,
                message: Resources[fullType].toString()
            });
        }
    }
}

export { ACWebSocketClient }