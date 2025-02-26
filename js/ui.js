/************

	ui.js

	this is the javascript for all the buttons etc.
	file created 2018-07-19
	
	bugs: volume slider should jump to 0 when muted
	atm mute works fine, but the volume slider stays at its value on mute

************/

let curTrackIndex = 0;
let oldTrackIndex = 0;
let newTrackIndex = 0;
let playedFirstTrack = false;
let playRandom = true;
let previousTracks = [];


//var isPlaying = false;

//prev volume variable is for the mute/unmute feature
let prevVolume = 50;
let prevVolumeLabel = 50;


document.getElementById('btn-mute').addEventListener('click', () => {
	let muted = false;
	muted = player.isMuted();

	log(muted)

	if (muted) {
		unmutePlayer();
	} else {
		mutePlayer();	
	}
});



const calcVolumeLabel = val => {
	return Math.floor((val / 100000)*100);
}

const setVolume = sliderValue =>{
	const val = parseInt(sliderValue);

	const volSlider = document.getElementById('vol-control');
	const volLabel = document.getElementById('vol-indicator');
	const muteButton = document.getElementById('btn-mute');

	volSlider.value = sliderValue;
	volLabel.innerText = val;

	if (player.isMuted() && val > 0) {
		player.unMute();
		volLabel.innerText = prevVolumeLabel;
	}

	// View low volume icon on lower volumes
	if (val > 0 && val < 40) {
		muteButton.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
	} else {
		muteButton.innerHTML = '<i class="fas fa-volume-up"></i>'
	}

	// If the slider is slided to 0 by hand on UI
	if (val <= 0) {
		player.mute();	
		muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
	}
	
	// If volume is slided normally by hand on UI
	if (val > 0) {
		if (player.isMuted()) {
			player.unMute();
		}
		prevVolume = val;
		prevVolumeLabel = val;
	}	

	player.setVolume(val);
}

const logslider = position => {
	//https://stackoverflow.com/a/846249
	// position will be between 0 and 100
	const minp = 0;
	const maxp = 100000;

	// The result should be between 100 an 10000000
	const minv = Math.log(1);
	const maxv = Math.log(101);

	// calculate adjustment factor
	const scale = (maxv-minv) / (maxp-minp);

	let result = Math.exp(minv + scale*(position-minp));
	//result /= 100000;
	result -= 1;
	result = Math.floor(result);
	return result;
}


const checkPlayButton = () => {
	const playerButton = document.getElementById('btn-play-pause');
	const infoButton = document.querySelector('#playlist-info > .info > .buttons > .button-cont.play > .play');

	const playIcon = '<i class="fas fa-play"></i>';
	const pauseIcon = '<i class="fas fa-pause"></i>';

	if (player.getPlayerState()	 === 1) {
		// Show pause icon
		playerButton.innerHTML = pauseIcon;
		infoButton.innerHTML = pauseIcon;
	} else {
		// Show play icon
		playerButton.innerHTML = playIcon;
		infoButton.innerHTML = playIcon;
	}		
}

const hideVideo = () => {
	//move player outside viewport to hide it
	//create invisible placeholder, the same size as player elem, to prevent elements moving around in player area.
	//player elem is position:absolute already in mobile view, so there's no need for placeholder, or to change positin prop
	const playerElem = document.querySelector('#player-elem');

	if (!mobileViewEnabled ) {
		const placeholder = document.createElement('div');
		placeholder.id = 'player-placeholder';
		placeholder.style.width = `${playerElem.offsetWidth}px`;
		placeholder.style.height = `${playerElem.offsetHeight}px`;
		playerElem.parentNode.insertBefore(placeholder, playerElem.nextSibling);
		playerElem.style.position = 'absolute';
	}

	playerElem.style.right = `-${playerElem.offsetWidth+10}px`;
}


const showVideo = () => {
	const playerElem = document.querySelector('#player-elem');
	const placeholder = document.getElementById('player-placeholder');

	if (!mobileViewEnabled && placeholder !== null ) {
		placeholder.remove();
		playerElem.style.position = 'relative';
	}

	playerElem.style.right = `0px`;
}

const changeTrackInfo = i => { 
	//log(playlist[i])

    const image = playlist[i].img || 'https://i.imgur.com/ntxagOk.jpg';
    const track = playlist[i].name || "error in retrieving track name from playlist[trackIndex].track";
    const artist = playlist[i].artist || "error in retrieving track name from playlist[trackIndex].artist";
	const album = playlist[i].album || null;
	const year = playlist[i].year || null;

	const trackImageElem = document.querySelector('#track-info > .top >.image-cont > .image');
	const artistNameElem = document.querySelector('#track-info > .top > .name > .artist');
	const trackNameElem = document.querySelector('#track-info > .top > .name > .track');
	const ytLinkElem = document.querySelector('#track-info > .bot > .video-name > a.link');

	const videoId = playlist[i].yt;
	const url = `https://youtu.be/${videoId}`;
	ytLinkElem.href = url;

	trackImageElem.src = image;
	trackNameElem.innerText = track;


	let artistStr = artist;
	if (album !== null) {
		artistStr += " • " + album;
	}

	if (year !== null) {
		artistStr += " • " + year;
	}
	
	artistNameElem.innerText = artistStr;
}



const changeTrack = direction => {
	/************************************************************************************************
		parameter can be "next", "previous", "random" or "firstTrack":
		• next: proceed to next index, if at last index, proceed to 1st index
		• previous: same as next, but in reverse
		• random: select a random index, reroll to prevent playing same track twice in a row
		• firstTrack: set the new track index as 0 (newTrackIndex = 0)		
        
	************************************************************************************************/
	musicIsPlaying = true;
	setMobileStatusLightColor('orange');
	//$('#mobile-track-label-text').text('changing...'); 
	const mobileTrackLabel = document.querySelector('#mobile-track-label > .label')
	mobileTrackLabel.innerText = 'changing...'; 
	//log(playlist[0])

	if (playlist.length === 0) {
		log('playlist is empty');
		return false
	}
	
	curTrackIndex = parseInt(curTrackIndex);


	if (!playedFirstTrack) {playedFirstTrack = true;}
	$('#track-name').html('');
	switch (direction) {
	
		case "next":
			if (curTrackIndex === playlist.length-1) {
				newTrackIndex = 0;
			} else {
				newTrackIndex = curTrackIndex+1;
			}			
			previousTracks.push(newTrackIndex);
			break;
		
		case "previous":
			if (previousTracks.length > 0) {
				previousTracks.pop();
				newTrackIndex = previousTracks[previousTracks.length - 1];
			} else {
				newTrackIndex = ranNum(0, playlist.length-1);
			}		
			break;				
			
		case "random":		
			newTrackIndex = ranNum(0, playlist.length-1);
			//reroll until tracks until we get a new song
			while (curTrackIndex === newTrackIndex) {
			//while (previousTracks.includes(newTrackIndex)) {		
				newTrackIndex = ranNum(0, playlist.length-1);	
			}
			previousTracks.push(newTrackIndex);
			break;
            
        case "firstTrack":		
			newTrackIndex = 0;
			previousTracks.push(newTrackIndex);
			break;
			
		default:
			console.log("ERROR: error in changeTrack function; switch(direction)");
	}
	
	if (previousTracks.length >= 100)  {	
		previousTracks.shift();
	}

	$('.item').eq(curTrackIndex).removeClass('playing'); //remove the previous highlight	
	curTrackIndex = newTrackIndex;
	const trackElems = document.querySelectorAll('#track-items > .item');
	const trackElem = trackElems[curTrackIndex];
	trackElem.classList.add('playing')


	const i = newTrackIndex;	

	const vidId = playlist[i].yt;
	if (vidId === null || vidId === undefined) {
		setMobileStatusText("Video id is null or undefined", "orange");
		changeTrack(direction);
		return false;
	}	

 	// Video is played in onPlayerStateChange (index.js) when it is qued
	player.cueVideoById(vidId.toString());
	checkPlayButton();
	setMobileStatusText('loading...', 'orange');
	changeTrackInfo(i);
	setTrackViewInfo(i);

	viewPlayingTrack(trackElem);

}

/*
The possible values for getPlayerState() are:
-1 – not iniciated
0 – Ended
1 – Playing
2 – Paused
3 – Buffering
5 – Cued
*/




const buttonAnimation = elemId => {

	//skip animations if on mobile view
	if (mobileViewEnabled) { return false; }

	const elem = document.getElementById(elemId);
	const originalBgColor = elem.style.backgroundColor;
	//log(originalBgColor)
	elem.style.transition = 'background-color 0s';
	elem.style.backgroundColor = '#189a46';
	//reset style back to normal after a delay
	setTimeout(() => {
		elem.style.transition = 'background-color 0.5s';
		//play button has its own bg color
		if (elemId === 'play-button-container') {
			
		} else {
			//elem.style.backgroundColor = originalBgColor;
		}

		elem.style.backgroundColor = originalBgColor;
		
	}, "10")
}



/*** play button ***/
$('#play-button-container').click(() => { 
	if (playlist.length === 0) {
		return false
	}
	const playerState = player.getPlayerState(); // 1 = PLAYING

	if (playerState	 === 1) {
		musicIsPlaying = false;
		pauseVideo();
	//} else if (isPlaying === false && playedFirstTrack === false) {
	} else if (playerState !== 1 && player.getVideoUrl() === "https://www.youtube.com/watch") {			
		//if user hasn't clicked any song and just clicks the play button, then:
		musicIsPlaying = true;	
		playRandom ? changeTrack("random") : changeTrack("firstTrack");	
	//} else if (isPlaying === false) {	
	} else if (playerState !== 1) {		
		musicIsPlaying = true;	
		playVideo();
	}
	checkPlayButton();
	buttonAnimation('play-button-container');
});


/*** stop button ***/
$('#stop-button-container').click(() => { 
	if (playlist.length === 0) {
		return false
	}
	stopVideo();
	//isPlaying = false;
	//checkPlayButton();	
	buttonAnimation('stop-button-container');
});


/*** next button ***/
$('#next-button-container').click(() => { 
	if (playlist.length === 0) {
		return false
	}
	playRandom ? changeTrack("random") : changeTrack("next"); 
	buttonAnimation('next-button-container');
});


/*** previous button ***/
$('#previous-button-container').click(() => { 
	if (playlist.length === 0) {
		return false
	}
	changeTrack("previous");
	buttonAnimation('previous-button-container');
});


//the "pause-retry" button on the right of the buttons row
//used to pause and play videos which are stuck for some reason
const retryPlayback = action => {
    // pause/stop video, then play to retry stuck video playback
	if (playlist.length === 0) {
		return false
	}
    if (action === "pause") {
        pauseVideo();	   
    } else if (action === "stop") {
        stopVideo();	  
    }   
	player.playVideo() 
}


$('#retry-pause-button-container').click(() => { 
    retryPlayback("pause");
	buttonAnimation('retry-pause-button-container');
});


const randomOn = () => {
	playRandom = true;
	setToggleButtonStyles();
}

const randomOff = () => {
	playRandom = false;
	setToggleButtonStyles();
}

const toggleRandom = () => {
	playRandom = !playRandom;
	playRandom ? randomOn() : randomOff(); 
}

const trackViewOn = () => {
	trackView = true;
	setToggleButtonStyles();
	setTrackView();
}

const trackViewOff = () => {
	trackView = false;
	setToggleButtonStyles();
	setTrackView();
}













const toggleTrackView = () => {
	trackView = !trackView;
	trackView ? trackViewOn() : trackViewOff(); 
}


//set styles for toggle buttons. Each button has a boolean variable tied ot it.
const setToggleButtonStyles = () => {
	const onColor = settings.toggleButtonColor.on;
	const offColor = settings.toggleButtonColor.off;

	//pairs of toggle button elems and variables which they're related to.
	const buttons = [ 
		{ elem: '#btn-random', var: playRandom },
		{ elem: '#btn-toggle-view', var: tileView },
		{ elem: '#btn-hide-video', var: viewVideoPlayer },
		{ elem: '#btn-toggle-track-view', var: trackView }
	];

	for (const button of buttons) {
		let color;
		button.var ? color=onColor : color=offColor;
		$(button.elem).css('color', color);
	}

}


$('#btn-random').click(() => { 
	toggleRandom();
});

$('#btn-toggle-track-view').click(() => { 
	//dont change to track view on desktop, trackview is only for mobile
	//if (!mobileViewEnabled) { return false; }
	toggleTrackView();
});





$('#btn-hide-video').click(() => { 
	viewVideoPlayer = !viewVideoPlayer;
	setVideoVisibility();
	setToggleButtonStyles();
});
 

const setVideoVisibility = () => {
	const toggleButtonMobile = document.getElementById('toggle-video-mobile');
	const playerElem = document.getElementById('player-elem');
	const trackViewElem = document.getElementById('track-view');

	if (mobileViewEnabled) {

		//dont use animation if playlist is long to avoid lag
		if (playlist.length >= 5000) {
			trackViewElem.style.transition = 'height 0s';
			playerElem.style.transition = 'right 0s';
		} else {
			trackViewElem.style.transition = 'height 0.1s';
			playerElem.style.transition = 'right 0.2s';
		}

		

	}
	

	let trackViewH = -1;

	//hardcoded values for now
	//const topBarH = document.getElementById('top-banner').offsetHeight;
	const topBarH = 50;
	const playerAreaH = 200;

	//trackViewH = window.innerHeight - topBarH - playerAreaH;

	if (!viewVideoPlayer) {		

		hideVideo();	
		//trackViewH = window.innerHeight - 175;
	} else {
		showVideo();
		//trackViewH = window.innerHeight - 175;
	}	


	//trackViewElem.style.height = `${trackViewH+1}px`;
	

}







let resizeTimer;
$(window).on('resize', e => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => { // Run code here, resizing has "stopped"		
		viewportW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		if (viewportW <= mobileWidth) {
			mobileViewEnabled = true;
			//to-do: this moveElementY is not used anymore, these deays we use css animations
			setVideoVisibility();
			if (viewVideoPlayer) {		
	
			} else {
		
			}	


			$('#mobile-track-label').css('display','block');
		} else {
			mobileViewEnabled = false;
			viewVideoPlayer = true; 
			setVideoVisibility();
			$('#mobile-track-label').css('display','none');
		}        
	}, 250);
});


