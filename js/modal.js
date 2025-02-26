
const  setModalListeners = () => {
    const modalBg = document.getElementById('modal-bg');
    const closeModal = document.getElementById('close-modal');
    const sleepTimerSwitch = document.getElementById('sleep-timer-switch');
    const sleepTimerDurationSlider = document.getElementById('playback-duration');
    const sleepTimerFadeoutSlider = document.getElementById('fadeout-duration');
    const copyShareUrlToClipboardButton = document.querySelector('#share-content > .content > .url-cont > .copy');



    closeModal.addEventListener('click', () => {
        showModal(false);
    })

    modalBg.addEventListener('click', () => {
        showModal(false);
    })

    copyShareUrlToClipboardButton.addEventListener('click', () => {
        copyShareUrlToClipboard();
    })

    sleepTimerSwitch.addEventListener('click', (e) => {
        const isChecked = e.target.checked;

        if (isChecked) {
            startSleepTimer();
        } else {
            stopSleepTimer();
        }

        setSleepTimerLabels(isChecked);
    })

    sleepTimerDurationSlider.addEventListener('input', (e) => {
        stopSleepTimer();
        const value = parseInt(e.target.value);
        sleepTimer.playbackDuration = value;
        let valueStr = `${value} hour`;
        if (value > 1) { valueStr += 's'}
        document.getElementById('playback-duration-label').innerText = valueStr;
    })

    sleepTimerFadeoutSlider.addEventListener('input', (e) => {
        stopSleepTimer();
        const value = parseInt(e.target.value);
        sleepTimer.fadeoutDuration = value;
        const valueStr = `${value} minutes`;
        document.getElementById('fadeout-duration-label').innerText = valueStr;
    })
}

const setModalContent = (page) => {
    const allElems = document.querySelectorAll('#modal > .box > div');
    for (let i = 0; i<allElems.length; i++) {
        const elem = allElems[i];
        elem.style.display = 'none';
    }    

    let targetClass;

    switch (page) {
        case 'about':
            targetClass='about-content';
            break;
        case 'sleep-timer':
            targetClass='sleep-timer-content';
            break;
        case 'share':
            targetClass='share-content';
            break;
    }

    const targetElem = document.getElementById(targetClass);
    targetElem.style.display = 'block';

    const closeButton = document.getElementById('close-modal');
    closeButton.style.display = 'block';
}


const showModal = (show=true) => {
    const transitionTime = 0.2 //this is the same as in modal.css
    let display, visibility, opacity;


    if (show) {
        display='flex'; 
        visibility='visible';
        opacity=1
    } else {
        display='none'; 
        visibility='hidden';
        opacity=0
    }
   
    const elem = document.getElementById('modal');

    if (show) {
        //modal is opened
        elem.style.visibility = visibility;
        elem.style.opacity = opacity;
    } else {
        //modal is closed
        elem.style.opacity = opacity;
        setTimeout(() => {
            elem.style.visibility = visibility;
        }, transitionTime*1000);
    }
}


const setSleepTimerLabels = isChecked => {
    let stateStr = 'OFF'
    if (isChecked) {stateStr = 'ON'; }

    const stateText = document.querySelector('#sleep-timer-state-container > span');
    const menuEntry = document.getElementById('sleep-timer');

    stateText.innerText = `${stateStr}`;
    menuEntry.innerText = `Sleep timer ${stateStr}`;
}

setModalListeners();
