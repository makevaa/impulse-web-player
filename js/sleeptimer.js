const sleepTimer = {
    on:false, //from input switch
    playbackDuration:3, //hours, from input slider
    fadeoutDuration:10, //minutes, from input slider
    updateInterval:2000, //ms
    startTime:-1, //time started, when on-switch was flipped on
    counterHandle:-1,
    timeLeftElem: document.getElementById('time-left'),
    playerStartVol:-1,
}

const formatMs = ms => {
    let s = ms/1000;
    let m = s/60;
    let h = m/60;

    s = s % 60;
    m = m % 60;
    h = h % 24;

    s = Math.floor(s);
    m = Math.floor(m);
    h = Math.floor(h);

    s = s.toString().padStart(2, '0');
    m = m.toString().padStart(2, '0');
    h = h.toString().padStart(2, '0');

    let str = `${h}:${m}:${s}`;
    return str;
}


const updateSleepTimer = () => {
    if (!sleepTimer.on) { return false; }

    const elapsed = Date.now() - sleepTimer.startTime;
    const fadeoutDur = sleepTimer.fadeoutDuration;
    
    const timeLeft = sleepTimer.playbackDuration - elapsed;
    const timeLeftStr = formatMs (timeLeft);

    if (timeLeft <= 0) {
        // Time limit reached, stop music
        stopSleepTimer();
        musicIsPlaying = false;
        insertExitElem();

    } else if  (timeLeft < fadeoutDur) {
        // Inside the fadeout time, lower volume gradually here
        // Calculate percent of how far we are in the fadeout time, lower volume accordingly
        let percent = (fadeoutDur-timeLeft)/fadeoutDur;
        percent = 1-percent;
        let vol = sleepTimer.playerStartVol*percent;
        player.setVolume(vol)
    }

    sleepTimer.timeLeftElem.innerText = timeLeftStr;
}






const startSleepTimer = () => {
    //convert playbackDuration from hours to ms
    sleepTimer.playbackDuration = hToMs(sleepTimer.playbackDuration);
    //convert fadeoutDuration from minutes to ms
    sleepTimer.fadeoutDuration = mToMs(sleepTimer.fadeoutDuration);

    //sleepTimer.playbackDuration =  30*1000//ms, debug
    //sleepTimer.fadeoutDuration = 15*1000//ms, debug

    sleepTimer.on = true;
    sleepTimer.startTime = Date.now();
    sleepTimer.counterHandle = setInterval(updateSleepTimer, sleepTimer.updateInterval);

    //update timeleft right away for responsiveness
    sleepTimer.timeLeftElem.innerText = formatMs(sleepTimer.playbackDuration-(sleepTimer.startTime-sleepTimer.startTime));
    sleepTimer.playerStartVol = player.getVolume();
}

const stopSleepTimer = () => {
    const sleepTimerSwitch = document.getElementById('sleep-timer-switch');

    if (sleepTimerSwitch.checked) {
        sleepTimerSwitch.checked = false;
    }

    setSleepTimerLabels(sleepTimerSwitch.checked);

    sleepTimer.on = false;
    clearInterval(sleepTimer.counterHandle);

    //reset the ms values to normal hours and minutes
    sleepTimer.playbackDuration = msToH(sleepTimer.playbackDuration);
    sleepTimer.fadeoutDuration = msToM(sleepTimer.fadeoutDuration);
    sleepTimer.timeLeftElem.innerText = '(sleep timer off)';

   
}


const hToMs = (h) => {
    return h*60*60*1000;
}

const mToMs = (m) => {
    return m*60*1000;
}

const msToH = (ms) => {
    return ms/60/60/1000;
}

const msToM = (ms) => {
    return ms/60/1000;
}










