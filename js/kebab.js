
// Set the opening and closing of the main kebab menu
const  setKebabMenu = () => {
    const kebab = document.querySelector('#main-kebab.kebab-cont > .kebab'),
    open = kebab.querySelector('.open'),
    close = kebab.querySelector('.close'),
    dropdown = kebab.querySelector('.dropdown');

    kebab.addEventListener('click', () => {
        open.classList.toggle('active');
        close.classList.toggle('active');
        dropdown.classList.toggle('active');
    });
}

const insertExitElem = () => {
    const imgContainer = document.createElement('div');
    imgContainer.id = 'exit-image';
    const img = document.createElement('img');
    img.setAttribute('src','icon/android-chrome-384x384.png');
    imgContainer.append(img);

    const textElem = document.createElement('p');
    textElem.innerText = 'App closed \n Reload page to restart';


    const reloadButton = document.createElement('div');
    reloadButton.id = 'reload-page';
    reloadButton.innerText = 'Reload';

    reloadButton.addEventListener('click', () => {
        location.reload();
    })

    const elem = document.createElement('div');
    elem.id = 'exit-message';
    elem.append(imgContainer);
    elem.append(textElem);
    elem.append(reloadButton);


    document.body.innerHTML = '';
    //document.body.innerHTML = text;
    document.body.style.backgroundColor = 'black';
    document.body.append(elem);
}


// Set the menu items inside kebab menu
const  setKebabMenuContent = () => {
    const exit = document.getElementById('exit');
    const about = document.getElementById('about');
    const sleepTimer = document.getElementById('sleep-timer');
    
    exit.addEventListener('click', () => {
        if (confirm("Exit app?")) {
            musicIsPlaying=false;
            insertExitElem();
        }
    })

    about.addEventListener('click', () => {
        setModalContent('about');
        showModal(true);
    })

    sleepTimer.addEventListener('click', () => {
        setModalContent('sleep-timer');
        //createSleepTimerPage();
        showModal(true);
    })
}

setKebabMenu();
setKebabMenuContent();
