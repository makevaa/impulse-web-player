// share.js


// Build and return share url here
const getShareUrl = (type, trackIndex) => {
    let url = window.location.origin;

    url += `/impulse?playlist=${currentPlaylistName}`;

    if (type === 'track') {
        url += `&track=${trackIndex}`;
    }

    url = encodeURI(url);
    return url;
}

// Url for sharing on Telegram
const getTelegramUrl = (myUrl, trackIndex) => {
    let text = ''

    if (trackIndex > -1) {
        const track = playlist[trackIndex];
        const artist = track.artist;
        const trackName = track.name;
        text = `👽🔊 ${trackName} by ${artist}`;
    } else {
        text = `👽🔊 ${currentPlaylistName} playlist`;
    }

    //text += ' | 👽 Impulse web player';

    myUrl = encodeURIComponent(myUrl);
    text = encodeURIComponent(text)

    let tgUrl = `https://t.me/share/url?url=${myUrl}&text=${text}`;
    return tgUrl;
}


// type is string "playlist" or "track"
// playlist 
const setShareUrl = (type, trackIndex=-1) => {
    const url = getShareUrl(type, trackIndex);

    const target = document.querySelector('#share-content > .content > .url-cont > input.url');
    target.value = url;

    const telegramButton = document.querySelector('#share-content > .content > .social-buttons > a.button.telegram');
    const tgUrl = getTelegramUrl(url, trackIndex);
    telegramButton.setAttribute('href', tgUrl);
}

const copyShareUrlToClipboard = () => {
    const elem = document.querySelector('#share-content > .content > .url-cont > input.url');
    navigator.clipboard.writeText(elem.value);

    const statusElem =  document.querySelector('#share-content > .content > .copy-status');
    const statusDefaultText = statusElem.innerText;

    statusElem.innerText = 'Copied url to clipboard';

    setTimeout(() => { 
        statusElem.innerText = statusDefaultText;
    }, 2000);
}

