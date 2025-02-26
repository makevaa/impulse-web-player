/* link.js
    read params from url
        playlist name
        track index

*/

const getParamFromUrl = (rawUrl, paramName) => {
    const paramValue = rawUrl.searchParams.get(paramName);
    return paramValue;
}

const currentUrlHasParams = () => {
    const url = window.location.href;
    let hasParams = false;
    if(url.includes('?')){
      hasParams = true
    }
    return hasParams;
}


const getUrlParams = () => {
    const currentUrl = new URL(document.location.href);
    const params = currentUrl.searchParams;
    //log(params);
 

    const playlistName = params.get('playlist');
    if (playlistName !== null) {
        openPlaylist(playlistName);
    }

    const trackIndex = params.get('track');
    if (trackIndex !== null) {
        //log(trackIndex)
        playTrack(trackIndex);
    }

    
    // clean url of parameters afterwards
    if (settings.cleanUrlParams) {
        const baseUrl = window.location.href.split("?")[0];
        window.history.pushState('name', '', baseUrl);
    }
  
}


const openPlaylist = playlistName => {
    const playlistElems = document.querySelectorAll('#sidebar > .playlists > .playlist-item');
    log(playlistElems)
    log (playlistName)
    // Find playlist element from DOM menu based on name
    for (let i=0; i<playlistElems.length; i++) {
        const name = playlistElems[i].getAttribute('data-name');
        if (name === playlistName) {
            playlistElems[i].click();
            return true
        }
    }


    //const playlist = playlistElems[playlistIndex];
    //playlist.click()
}


const playTrack = trackIndex => {
    const trackItems = document.querySelectorAll('#track-items > .item');
    const track = trackItems[trackIndex];
    const trackPlayButton =  track.querySelector('.image-cont');

    playOnClick(trackIndex);

    setTimeout(() => { 
        viewPlayingTrack();
        trackPlayButton.click();
    }, 800);
}