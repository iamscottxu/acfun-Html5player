import { Player } from './lib/player'
import { LoadUI } from './ui'
import { ChangePart } from './Part'
import { ChangeBangumi } from './Bangumi'

let $ = require('jquery');

window.H5Player = {
    resize: () => {},
    isSupported: () => true
}

$(() => {
    if (typeof pageInfo != 'object') return;
    let videoInfo = {
        videoId: pageInfo.videoId ? pageInfo.videoId : (bgmInfo.videoId ? bgmInfo.videoId : pageInfo.video.videos[0].videoId),
        coverImage: pageInfo.coverImage ? pageInfo.coverImage : (bgmInfo.image ? bgmInfo.image : pageInfo.video.videos[0].image)
    } //视频基本信息

    let player = new Player($('#ACHtml5Player_player > video')[0], $('#ACHtml5Player_bulletScreens')[0]);
    if(pageInfo && pageInfo.videoList && pageInfo.videoList.length > 1) ChangePart(player);
    else if(pageInfo && pageInfo.album) ChangeBangumi(player);
    LoadUI(player, videoInfo.coverImage);
    player.load(videoInfo.videoId, GetUrlParameter('autoplay') != null);

    //获取 URL 参数
    function GetUrlParameter(parameterName) {
        let url = document.location.toString();
        let splitUrl = url.split('#');
        if (splitUrl.length === 1) return null;
        for (let parameter of splitUrl[1].split('&')) {
            let splitParameter = parameter.split('=');
            if (splitParameter[0].toLowerCase() === parameterName.toLowerCase()) {
                if (splitParameter.length == 1) return '';
                else return decodeURIComponent(splitParameter[1]);
            }
        }
        return null;
    }
});