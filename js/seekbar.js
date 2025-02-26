
const setSeekbar = () => {
    const lengthNumber = document.querySelector('#controls > .section > .seekbar-cont > .number.length');
    const videoLengthSecs = player.getDuration();
    lengthNumber.innerText = secsToStr(videoLengthSecs);
}

const secsToStr = totalSecs => {
    const mins = Math.floor(totalSecs/60);;
    let secs = totalSecs % 60;
    if (secs < 10) {
        secs = '0'+secs;
    }

    const str = `${mins}:${secs}`;
    return str
}

const startTrackTimeInterval = () => {
    trackTimeInterval = setInterval(updateTrackTime, 1000);
}

const stopTrackTimeInterval = () => {
    clearInterval(trackTimeInterval);
}




const updateTrackTime = () => {
    if (seeking) {
        return false;
    }

    // code to check the current time of the song and to display it
    let secs = Math.floor(player.getCurrentTime());
    if (secs == NaN) {
        secs = 0;
    }

    const progressStr = secsToStr(secs);
    const progressNumber = document.querySelector('#controls > .section > .seekbar-cont > .number.progress');
    progressNumber.innerText = progressStr;


    const totalLength = Math.round(player.getDuration());
    const percent = secs/totalLength*100;


    setSeekbarFill(percent);
}

const seekToTime = percent => {
    if (playlist.length <= 0) { return false}
    const rounded = Math.round(percent);

    const totalLength = Math.floor(player.getDuration());
    const targetSeconds = totalLength * (rounded/100);

    player.seekTo(targetSeconds);
    setSeekbarFill(rounded);
}

const setSeekbarFill = percent => {
    if (playlist.length <= 0) { return false}
    const filledBar = document.querySelector('#controls > .section > .seekbar-cont > .bar > .filled');
    const rounded = Math.round(percent);
    filledBar.style.width = `${rounded}%`;

    
    const thumb = document.querySelector('#controls > .section > .seekbar-cont > .bar > .thumb');
    thumb.style.left = `${rounded}%`;
}


const setSeekbarProgressNum = percent => {
    //log('setSeekbarProgressNum')
    const rounded = Math.round(percent);
    const trackDuration = Math.floor(player.getDuration());

    const targetSeconds = Math.round(trackDuration *  (percent/100));
    const progressStr = secsToStr(targetSeconds);
    const progressNumber = document.querySelector('#controls > .section > .seekbar-cont > .number.progress');
    progressNumber.innerText = progressStr;

}



