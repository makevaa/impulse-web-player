/**************
index.js
**************/

const settings = {
	changeTrackViewBackground: true, // change trackview to match album art
	changePlayerAreaBackground: false, // works only if colorthief stuff is enabled at all
	changeTopBarBackground: false, 
	changeUiColors: false, // change UI color to match track color
	toggleButtonColor: {
		on:'#1db954',
		off:'#a19f9f' // a19f9f 747272
	},
	statusLightColors: {
		'red': {color: 'red', shadow: 'red' },
		'orange': {color: 'orange', shadow: '#e68019' },
		'green': {color: '#00e600', shadow: '#00e600' },
	},

	devMode:false,
	debugMute: false, // mute player on default
	cleanUrlParams:true // true for live
}



const dataFile = "music-list-data.json";
let musicData; // the whole json file in object, has "tracks" and "playlists" props
let playlist = []; //this is the current tracklist
let playlists = new Map(); // Map of playlist, playlist name as key
let tileView = false; //false means the "row view"
//let darkTheme = false;
let player;
//let artistDefaultColor = []; //object literal with artistName and colorId props
let viewVideoPlayer = true; //visibility of the yt embed
//let inPlaylistSelection = false;
let trackView = false; //the big view which shows art and info
let musicIsPlaying = false; //global variable for mobile background play
let currentPlaylistName = -1; 
let trackTimeInterval; //variable for setInterval to update track progress time for seekbar
let seeking = false; // for seekbar drag-to-seek behavior

let playerIsReady = false; // Player is ready to play music
let dataIsReady = false // Data is ready to be used

const showLoadingSpinner = () => { 
	$("#loading-icon-container").css('opacity','1'); 
    $("#loading-icon-container").css('visibility','visible'); 	
}


const showStartSpinner = (callback) => {
	window.scrollTo(0, 0);
	showLoadingSpinner();

	setTimeout(function() { 
		callback (); 
	}, 100);
}


const fetchData = () => {
	fetch(dataFile)
	.then((response) => response.json())
	.then(json => processData(json) );
}

showStartSpinner(fetchData);


// Create megalist, playlist with all tracks in data
const createMegalist = data => {
	const megalistObj = {
		name:"Megalist",
		desc:"All playlists combined",
		image:'https://i.imgur.com/0kPFntf.jpg',
		imageSmall:'https://i.imgur.com/0kPFntf.jpg',
		tracks:[],
	}
	
	for (let i=0; i<data.tracks.length; i++) {   
		megalistObj.tracks.push(i);
	}

	playlists.set('Megalist', megalistObj);
}


const processData = data => {
	const tracks = data.tracks;

	// Set data for playlist map
	for (let i=0; i<data.playlists.length; i++) {
		const obj = {
			name: data.playlists[i].name,
			desc: data.playlists[i].desc,
			image: data.playlists[i].image,
			imageSmall: data.playlists[i].imageSmall,
			tracks:[],
		}
		playlists.set(data.playlists[i].name, obj);
	}

	// Process imgur ids and add default images to tracks
	for (let i=0; i<tracks.length; i++) {
		const track = tracks[i];
		const img = track.img;
		let imageUrl;

		if (img !== null) {
			imageUrl = `https://i.imgur.com/${img}.jpg`; //imgur urls work with both .jpg and .png
		} else {
			imageUrl = 'https://i.imgur.com/OgvGLJt.jpeg'; //add default image
		}

		track.img = imageUrl;

		// Add track index to playlist map objects
		for (let j=0; j<track.pl.length; j++) {
			const playlist = playlists.get(track.pl[j])
			playlist.tracks.push(i);
		}
	}

	createMegalist(data);
	musicData = data; // Store data to global variable
	preload(data); // Preload playlist images, if needed

	createSidebarPlaylists(data);
	initSettings();

	hideLoadingSpinner();
	showPlayerArea();

	dataIsReady = true;
	if (playerIsReady && dataIsReady && currentUrlHasParams() ) {
		getUrlParams();
	} 
}


// Set the colored "led-light" element at the bottom, visible in mobile view
const setMobileStatusLightColor = colorParam => {
	const color = settings.statusLightColors[colorParam].color;
	const shadow = settings.statusLightColors[colorParam].shadow;
	const colorLight = document.querySelector('#mobile-track-label > .color-light-cont > .color-light'); 
	colorLight.style.backgroundColor = color;
	colorLight.style.boxShadow = `0px 0px 5px ${shadow}`;
}

const setMobileStatusText = (str, colorParam) => {
	const mobileTrackLabel = document.querySelector('#mobile-track-label > .label');
	const text = `<div>${str}</div>`;
	mobileTrackLabel.innerHTML = text;

	let color = colorParam;
	if (color === undefined) {color='green'}
	setMobileStatusLightColor(color);
}




const onPlayerError = event => {
	let skip = true;
	
	if (event.data === 5) {
		setMobileStatusText("Error "+event.data+": The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.","orange"); 		
	} else if (event.data === 101 || event.data === 150) {
		setMobileStatusText("Error "+event.data+": The owner of the requested video does not allow it to be played in embedded players (101/150).","orange"); 		
		skip=true;
	} else if (event.data === 100) {
		setMobileStatusText("Error "+event.data+": The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.","orange"); 		
		skip=true;
	} else if (event.data === 2) {
		setMobileStatusText("Error "+event.data+": The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.","orange"); 		
	}	
	
	setMobileStatusLightColor('orange');

	if(skip) {
		setTimeout( () => { //go to next track after a small timeout, we won't get stuck on errors
			playRandom ? changeTrack("random") : changeTrack("next"); 
		}, 10);		
	}
}

const initPlayerSettings = () => {
	player.setVolume(50);

	if (settings.debugMute) {
		mutePlayer();
		const mobileTrackLabel = document.querySelector('#mobile-track-label > .label');
		mobileTrackLabel.innerHTML = `<div>debugMute=true: player muted</div>`;
		setMobileStatusLightColor('orange')
	} else if (mobileViewEnabled) {
		player.setVolume(100);
	}

	playerIsReady = true;
	if (playerIsReady && dataIsReady && currentUrlHasParams() ) {
		getUrlParams();
	} 
}

//this has to be an old-style function declaration, arrow function makes this not load
var onYouTubeIframeAPIReady = function() {
    //setMyPlayerStatus("Loading", "orange");
    player = new YT.Player('player-elem', {
        height: '200',
        width: '200',

		playerVars: {
			'disablekb':1, //disable keyboard controls to player
			'iv_load_policy':3, //dont show video annotations
          },

        events: {
			'onReady': initPlayerSettings,
            'onError': onPlayerError,  
            'onStateChange': onPlayerStateChange
        }
    });	
}

const createPlaylistHeader = (itemStyle, playlistName) => {
	const playlistInfo = document.getElementById('playlist-info');
	playlistInfo.classList.remove('hidden');

	const image = playlistInfo.querySelector('.image-cont > img.image:not(.small)');
	const imageSmall = playlistInfo.querySelector('.image-cont > img.image.small');
	const type = playlistInfo.querySelector('.type');
	const name = playlistInfo.querySelector('.name');
	const desc = playlistInfo.querySelector('.desc');
	const trackAmount = playlistInfo.querySelector('.track-amount');

	const list = playlists.get(playlistName);

	imageSmall.src = list.imageSmall;
	image.src = list.image;

	type.innerText = 'Public playlist';
	name.innerText = playlistName;
	//desc.innerText = list.desc;
	trackAmount.innerText = `${list.tracks.length} tracks`;

	
	// Set playlist header background color based on playlist image
	image.addEventListener('load', ( () => {
		image.crossOrigin = "Anonymous";
		const colorThief = new ColorThief();
		let rgbValues = colorThief.getColor(image);
		rgbValues = adjustPlaylistHeaderColors(rgbValues);

		let [r, g, b] = [...rgbValues];

		const colorStr =  `rgb(${r}, ${g}, ${b})`;

		const gradientStr = `linear-gradient(0deg, #121212 0%, rgba(${r},${g},${b}, 0.5) 80%)`;

		document.querySelector('#playlist-info > .gradient-layer').style.background = gradientStr;
	}), true);
}


// itemStyle: 'tile' or 'row'
const createTrackItems = (itemStyle, playlistLength, playlistName) => {
	//const trackItemsCont = document.getElementById('track-items-cont');
	const trackItems = document.getElementById('track-items');

	trackItems.classList.remove('tile');
	trackItems.classList.remove('row');
	trackItems.classList.add(itemStyle);
	trackItems.innerHTML = '';

	for (let i=0; i<playlistLength; i++) {
		const elem = document.createElement('div');
		elem.classList.add('item');
		elem.setAttribute('data-index', i);

		if (playlist[i].yt === null) {
			elem.classList.add('disabled'); 
		}

		// Add attribute for the search feature
		let searchStr = `${playlist[i].artist} ${playlist[i].name}`;

		// Add album to Game Soundtracks, so we can search with game name too
		if (playlistName === 'Game Soundtrack' && playlist[i].album !== null) {
			searchStr += ` ${playlist[i].album}`
		}

		elem.setAttribute('searchstring', searchStr);

		const number = document.createElement('div');
		number.classList.add('number');
		number.innerText = i+1;
	

		const imageCont = document.createElement('div');
		imageCont.classList.add('image-cont');
		imageCont.setAttribute('data-index', i);

		const overlay = document.createElement('div');
		overlay.classList.add('overlay');
		overlay.innerHTML = `<i class='far fa-play-circle'></i>`;
		imageCont.append(overlay);

		const overlayPlaying = document.createElement('div');
		overlayPlaying.classList.add('overlay-playing');
		overlayPlaying.innerHTML = `<i class='fas fa-volume-up'></i>`;
		imageCont.append(overlayPlaying);

		const image = document.createElement('img');
		image.classList.add('image');
		image.src = playlist[i].img;
		imageCont.append(image);

		const info = document.createElement('div');
		info.classList.add('info');


		const track = document.createElement('div');
		track.classList.add('track');
		track.innerText = playlist[i].name;
		info.append(track);

		const artist = document.createElement('div');
		artist.classList.add('artist');
		artist.innerText = playlist[i].artist;

		if (itemStyle === 'row' && playlist[i].album !== null) {
			artist.innerText = `${playlist[i].artist} • ${playlist[i].album}`;
		}

		info.append(artist);

		const buttons = document.createElement('div');
		buttons.classList.add('buttons');
		
		const shareButton = document.createElement('div');
		shareButton.classList.add('button');
		shareButton.classList.add('share');
		shareButton.innerHTML = '<i class="fa-solid fa-share"></i>';
		buttons.append(shareButton);

		elem.append(number);
		elem.append(imageCont);
		elem.append(info);
		elem.append(buttons);

		trackItems.append(elem);
	}

	$("#right-side").animate({ scrollTop: 0 }, "fast");	
}




// When playlist option is clicked
const selectPlaylist = name => {
	//showWhileLoading();
	currentPlaylistName = name;

	const trackIndices = playlists.get(name).tracks; // global current playlist;
	playlist = [];

	for (let i=0; i<trackIndices.length; i++) {
		const index = trackIndices[i];
		const track = musicData.tracks[index];
		playlist.push(track);
	}


	playlist = sortByAttribute(playlist, 'artist', 'album');


	$("#playlist-length").text(`${playlist.length}`);
	$("#playlist-name").text(name);
	
	
	let itemStyle = 'tile';
	if (!tileView) { itemStyle = 'row'; }

	createPlaylistHeader(itemStyle, name);
	createTrackItems(itemStyle, playlist.length, name);


    if (mobileViewEnabled) {
		
		//darkTheme = true;
		toggleSidebar();
	} 

	window.scrollTo(-500, -500);
	hideLoadingSpinner(); 
	setTimeout(() => { 
		hideLoadingSpinner(); 
	}, 1000);

	const searchStr = `Filter ${name}...`
	setTopBarInfo(name, playlist.length, searchStr);

	showTopBar();
	showPlayerControls();
	showTopBarButtons(true);
	showSearchBar(true);
	setVideoVisibility();
}


const showPlayerArea = () => {
	$("#player-area").css('visibility','visible');
	$("#player-area").css('opacity','1');
	$("#mobile-track-label").css('visibility','visible');
    $("#toggle-video-mobile").css('visibility','visible');
}
const hidePlayerArea = () => {
	$("#player-area").css('visibility','hidden');
	$("#player-area").css('opacity','0');
	$("#mobile-track-label").css('visibility','hidden');
    $("#toggle-video-mobile").css('visibility','hidden');
}

const showPlayerControls = () => {
	const controls = document.getElementById('controls');
	const playerElem = document.getElementById('player-elem');
	controls.classList.remove('hidden');
	playerElem.classList.remove('hidden');
}

const showTopBar = () => { 
	$('#top-banner').css('display','flex'); 
	$('#top-banner').css('opacity','1'); 
}
const hideTopBar = () => { 
	$('#top-banner').css('opacity','0'); 
	$('#top-banner').css('display','none');
}


const setTopBarMargin = () => {
	const elem = document.getElementById('topbar');
	const h = elem.offsetHeight;
	const marginElem = document.getElementById('topbar-margin');
	marginElem.style.height = `${h}px`;
}

const showTopBarButtons = (show=true) => { 
	let display, opacity;
	show ? display='inline-block' : display='none';
	show ? opacity='1' : opacity='0';
	$('#top-banner > .buttons').css('opacity',opacity); 
	$('#top-banner > .buttons').css('display',display);
}


const showTopBarRows = (show=true) => {
	let display, opacity;
	show ? display='inline-block' : display='none';
	//show ? opacity='1' : opacity='0';
	const target = document.getElementById('topbar-rows');
	target.style.display = display;
}



const showTracks = () => { 
	const iconList = document.getElementById('icon-list');
	const rowList = document.getElementById('row-list');
	iconList.classList.remove('hidden');
	rowList.classList.remove('hidden');
}

const hideTracks = () => { 
	$('#icon-list').css('opacity','0'); 
	$('#row-list').css('opacity','0'); 
	$('#icon-list').css('display','none'); 
	$('#row-list').css('display','none'); 
}


const hideLoadingSpinner = () => { 
	$("#loading-icon-container").css('opacity','0'); 
    $("#loading-icon-container").css('visibility','hidden'); 	
}

const hideTitleArea = () => {
	const elem = document.getElementById('title-area');
	elem.style.display = 'none';
}

const getTitleAreaDisplayStyle = () => {
	let displayStyle = 'inline-flex';
	if (mobileViewEnabled) {
		//displayStyle = 'flex';
	}
	return displayStyle;
}

const showTitleArea = () => {
	const elem = document.querySelector('#topbar > .title-area');
	elem.style.display = getTitleAreaDisplayStyle();
}


const showWhileLoading = (callback, i) => {
	window.scrollTo(0, 0);
	hidePlaylistSelection();
	hideTitleArea();
	
	showLoadingSpinner();
	//showTopBar();
	showPlayerArea();
	
	setTimeout(function() { 
		callback (i); 
	}, 10);

}


// Toggle between tile/row view for tracks
const toggleView = () => {
	//dont do anything if it playlist selection
	if (inPlaylistSelection) { return false; }
	let itemStyle = -1;

	if (tileView) {
		//show row view
		itemStyle = 'row';
        tileView = false;
	} else {
		//show tile view
		itemStyle = 'tile';
        tileView = true;
	}	  

	createTrackItems(itemStyle, playlist.length, currentPlaylistName);
	setToggleButtonStyles(); 
}


// Scroll playing track into viewport
const viewPlayingTrack = () => {
	const target = document.querySelector('#track-items > .item.playing');
	if (target === undefined || target === null || target === -1) {
		return false;
	}

	let offset = 50;
	if (mobileViewEnabled) {
		offset = target.offsetHeight;
	} 

	if ( !(isVisible(target, document.getElementById('track-items'))) ) {
	//if (!isElementInViewport(target)) {
	
		//log(`Track is not visibile, scrolling to track: ${playlist[curTrackIndex].name}`)
		scrollToTargetAdjusted(target);
	}
}


// 5. The Youtube API calls this function when the player's state changes.
const onPlayerStateChange = event => {	 
	checkPlayButton();
	/* -1 – unstarted
		0 – ended
		1 – playing
		2 – paused
		3 – buffering
		5 – video cued */
	switch (event.data) {
		case YT.PlayerState.PLAYING: 
			//log("PLAYING")
			//isPlaying = true;
			let videoTitle = player.getVideoData().title;

			// Set video name in player-area, visible in desktop view
			const nameElem = document.querySelector('#track-info > .bot > .video-name > .name');
			nameElem.innerText = videoTitle;

			changePageTitle(videoTitle);	
			const mobileTrackLabel = document.querySelector('#mobile-track-label > .label');
			mobileTrackLabel.innerHTML = `<div>${videoTitle}</div>`;

			setMobileStatusLightColor('green');
			//musicIsPlaying = true;
			startTrackTimeInterval();
			break;

		case YT.PlayerState.ENDED:
			//log("ENDED")
			playRandom ? changeTrack("random") : changeTrack("next");	
			//musicIsPlaying = true;//track has just ended, so we assume that music was playing
			stopTrackTimeInterval();
			break;
		
		case YT.PlayerState.PAUSED:
			//log("PAUSED")
			//musicIsPlaying = false;
			stopTrackTimeInterval();
			break;	

		case YT.PlayerState.BUFFERING:
			//log("BUFFERING")
			//musicIsPlaying = false;
			break;	

		case YT.PlayerState.UNSTARTED:
			//log("UNSTARTED");
			//player.playVideo();
			//setSeekbar();
			//musicIsPlaying = false;
			stopTrackTimeInterval();
			//playVideo();
	
			break;	

		case YT.PlayerState.CUED:	
			//log("CUED")
			player.playVideo();
			setSeekbar();
			setTimeout(function() {
				//video is still "cued", probably a case of "video not available"
			
				//we need to chekc if video is cued AND if theres an error
				//because noramlly videos are always cued before playing,
				//if we click next button too fast the program thinks theres 

				if (player.getPlayerState() === 5) {
					//playRandom ? changeTrack("random") : changeTrack("next");
					
				}
			  }, 2000);
			break;

		default:
			log("error in onPlayerStateChange function, below event.data :")
			//log(event.data);
			//musicIsPlaying = false;
	}		
}


const setTrackView = () => {
	// trackView is global boolean
	const trackViewElem = document.getElementById('track-view');
	const playerAreaElem = document.getElementById('player-area');
	const playerElem = document.getElementById('player-elem');

	const playerAreaDefaultH = 200; // player area height on desktop and mobile
	let playerAreaNewH = playerAreaDefaultH; //don't change height on desktop

	let playerElemDefaultMargin = 0; // no margin on desktop, the "margin" is added height to one of button elements
	let playerElemNewMargin = playerElemDefaultMargin

	if (mobileViewEnabled) {
		playerAreaNewH = 300;
		playerElemDefaultMargin = 200;
		playerElemNewMargin = 300;
	}

	
	const marginElem = document.querySelector('#controls > .section.extra');


	// mobile track view h: 	height: calc(100% - 350px + 1px);

	let visibility, playerAreaTopBorder;

	if (trackView) {
		playerAreaElem.style.position = 'absolute';

		visibility='visible';
		playerAreaTopBorder='rgba(0,0,0,0.6)'; //same opacity as track-view-darkener
		playerAreaElem.style.height = `${playerAreaNewH}px`;
		marginElem.style.marginBottom = `${playerAreaNewH-playerAreaDefaultH}px`;
		playerElem.style.marginBottom = `${playerElemNewMargin}px`;
		
	} else {
		
		setTimeout(() => { 
			playerAreaElem.style.position = 'relative';
		}, 100);

		visibility='hidden';
		playerAreaTopBorder='#333333';
		playerAreaElem.style.height = `${playerAreaDefaultH}px`;
		marginElem.style.marginBottom = `0px`;
		playerElem.style.marginBottom = `${playerElemDefaultMargin}px`;
	}

	
	trackViewElem.style.visibility = visibility;
}


const setTrackViewInfo = i => {
	const imageElem = document.getElementById('track-view-image');
	const nameElem = document.getElementById('track-view-name');
	const artistElem = document.getElementById('track-view-artist');

	const track = playlist[i];
	
	imageElem.src = track.img;
	nameElem.innerText = track.name;
	artistElem.innerText = track.artist;

	if (mobileViewEnabled && settings.changeTrackViewBackground) { 
		setTrackViewBackgroundColor(); 
	}
}


const setTrackViewBackgroundColor = () => {
	const trackViewElem = document.getElementById('track-view');
	
	const img = document.getElementById('track-view-image');
	const colorThief = new ColorThief();
	let color;

	const adjustValueForBackground = val => {
		val = Math.floor(val * 0.4);

		if (val > 150) {
			//val = val - 100;
		}
		
		if (val <= 40) { val = 40; }
		return val;
	}

	const adjustValueForUi = val => {
		if (val > 150) {
			//val = val - 100;
		}
		
		if (val <= 100) { val += 100; }
		return val;
	}

	const setColor = colorArr => {
		let [r, g, b] = [...colorArr]

		let originalColorProp = `rgb(${r}, ${g}, ${b})`;
		let uiColorProp = `rgb(${adjustValueForUi(r)}, ${adjustValueForUi(g)}, ${adjustValueForUi(b)})`;
		

		r = adjustValueForBackground(r);
		g = adjustValueForBackground(g);
		b = adjustValueForBackground(b);
		let backgroundColorProp = `rgb(${r}, ${g}, ${b})`

		if (settings.changeTrackViewBackground) {
			const gradientStr = `linear-gradient(0deg, #121212 0%, rgba(${r},${g},${b}, 1) 80%)`;
			trackViewElem.style.background = gradientStr;
		}
		
		if (settings.changePlayerAreaBackground) {
			const playerAreaElem = document.getElementById('player-area');
			playerAreaElem.style.backgroundColor = backgroundColorProp;
		}

		if (settings.changeTopBarBackground) {
			const topBarElem = document.getElementById('topbar');
			topBarElem.style.backgroundColor = backgroundColorProp;
		}

	
		// Change all green from UI to match the current color
		if (settings.changeUiColors) {
			$("#toggle-video-mobile").css('border-color', uiColorProp);
			$("#back-to-playlists").css('border-color', uiColorProp);
			settings.toggleButtonColor.on = uiColorProp;
			setToggleButtonStyles();
			$("#playlist-length").css('color', uiColorProp);
		}

		img.removeEventListener('load', getColor, true)
	}

	const getColor = () => {
        color = colorThief.getColor(img);
		setColor(color);
	}

    // Make sure image is finished loading
    if (img.complete) {
		getColor();
    } else {
		img.addEventListener('load', getColor, true);
    }
}

const setTopBarInfo = (name, listLength, searchStr) => {
	const playlistName = document.querySelector('#topbar > .mid > .playlist-info > .name');
	const trackAmount = document.querySelector('#topbar > .mid > .playlist-info > .track-amount');
	const search = document.getElementById('search');

	playlistName.innerText = name;
	trackAmount.innerText = `${listLength} tracks`;

	if (mobileViewEnabled) {
		search.setAttribute('placeholder',searchStr);
	}
}


const playOnClick = i => {
	const videoId = playlist[i].yt;		
	
	if (videoId === null) {
		setMyPlayerStatus("Video id is null", "orange");
		return false;
	}	

	setMobileStatusText('loading...', 'orange');
	previousTracks.push(i);	

	// Remove the previous highlight	
	$('.item').eq(curTrackIndex).removeClass('playing'); 
	curTrackIndex = i;	
	$('.item').eq(curTrackIndex).addClass('playing');	
	
	if (playedFirstTrack === false) {playedFirstTrack = true;}

	player.cueVideoById(videoId);	
	changeTrackInfo(i);
	setTrackViewInfo(i);
	musicIsPlaying = true;
}


const toggleSidebar = () => {
	const sideBar = document.getElementById('sidebar');
	const rightSide = document.getElementById('right-side');
	const toggleSidebarButton = document.querySelector('#topbar > .title-area > .buttons > .button.toggle-sidebar');

	if (sideBar.classList.contains('hidden')) {
		// Show sidebar
		sideBar.classList.remove('hidden');
		rightSide.classList.add('hidden');
		toggleSidebarButton.style.color = settings.toggleButtonColor.on;
		showSearchBar(false);
		trackViewOff();
	} else {
		// Hide sidebar
		sideBar.classList.add('hidden');
		rightSide.classList.remove('hidden');
		toggleSidebarButton.style.color = settings.toggleButtonColor.off;
		showSearchBar(true);
	}
}


const setListeners = () => {
	const trackItems = document.getElementById('track-items');

	trackItems.addEventListener('click', e => {
		const target = e.target;
		// In tile view, play track on item click
		// In row view, play track on image-cont click
		
		if (trackItems.classList.contains('tile')) {
			// Tile view
			if ( target.classList.contains('item') ) {
				const i = target.getAttribute('data-index');
				playOnClick(i);
			}
		} else {
			// Row view
			if (target.classList.contains('image-cont')) {
				const i = target.getAttribute('data-index');
				playOnClick(i);
			} else if (target.classList.contains('share')) {
				const itemElem = target.parentElement.parentElement;
				const i = itemElem.getAttribute('data-index');
				setShareUrl('track', i);
				setModalContent('share');  
				showModal(true);  
			}
		}
	});

	// In row view & desktop, play track on item double-click
	if (!mobileViewEnabled) {
		trackItems.addEventListener('dblclick', e => {
			const target = e.target;
			if (trackItems.classList.contains('row')) {
				if ( target.classList.contains('item') ) {
					const i = target.getAttribute('data-index');
					playOnClick(i);
				}
			}
		});
	}


	// Pressing loading spinner removes it. In case of bug which makes it stuck on screen.
	document.getElementById('loading-icon-container').addEventListener('click', () => {
		hideLoadingSpinner(); 
	});

	document.getElementById('scroll-to-track-mobile').addEventListener('click', () => {
		buttonAnimation('scroll-to-track-mobile');
		viewPlayingTrack();
	});

	$('#btn-toggle-view').click(function() { 
		toggleView();
	});
	
	$('#btn-toggle-theme').click(function() { 
		toggleTheme();
	});
	

	// Big green "play" button in playlist info area
	const playlistInfoPlayButton = document.querySelector('#playlist-info > .info > .buttons > .button-cont.play');
	playlistInfoPlayButton.addEventListener('click', e => {
		const playerAreaPlayButton = document.getElementById('play-button-container');
		playerAreaPlayButton.click();
	});

	// "Share" button in playlist info area, show share modal on click
	const playlistInfoShareButton = document.querySelector('#playlist-info > .info > .buttons > .button-cont.share');
	playlistInfoShareButton.addEventListener('click', e => {
		setShareUrl('playlist');
		setModalContent('share'); 
		showModal(true); 
	});

	// Mobile view's toggle playlist menu
	const toggleSidebarButton = document.querySelector('#topbar > .title-area > .buttons > .button.toggle-sidebar');


	toggleSidebarButton.addEventListener('click', e => {
		toggleSidebar();
	});


	// Continue playing on background on mobile. 
	// document.visibilityState is 'visible' or 'hidden'.
	document.addEventListener("visibilitychange", function() {
		setTimeout(() => { 
			const pageState = document.visibilityState;

			if (pageState === 'hidden' && mobileViewEnabled && playedFirstTrack && musicIsPlaying) {
				playVideo();
			}
		});
	}, 2000);


	// Seekbar events: mouse-events for desktop, in addition touch-events for mobile view
	const seekBar = document.querySelector('#controls > .section >  .seekbar-cont > .bar');

	// Seekbar mouse-events for desktop view
	seekBar.addEventListener('mousedown', e => {
		seeking = true;
		//log('mousedown');
	});


	seekBar.addEventListener('mouseup', e => {
		seeking = false;
		const totalW = seekBar.offsetWidth;
		let percent = e.offsetX / totalW * 100;
		seekToTime(percent);
		//log('mouseup');
	});

	seekBar.addEventListener('mousemove', e => {
		if (seeking) {
			e.preventDefault();
			const totalW = seekBar.offsetWidth;
			let percent = e.offsetX / totalW * 100;
			setSeekbarFill(percent);
			setSeekbarProgressNum(percent);
	
		}
		//log('mousemove');
	});
	

	// Seekbar touch-events for mobile view
	if (mobileViewEnabled) {
		seekBar.addEventListener('touchstart', e => {
			seeking = true;
			//log('touchstart');
		});
		
		seekBar.addEventListener('touchend', e => {
			seeking = false;
			const totalW = seekBar.offsetWidth;

			//log(e)
			const bcr = e.target.getBoundingClientRect();
			const x = e.changedTouches[0].clientX - bcr.x;
			let percent = x / totalW * 100;
			seekToTime(percent);
			//log('touchend');
		});
		
		seekBar.addEventListener('touchmove', e => {
			if (seeking) {
				//e.preventDefault();
				const totalW = seekBar.offsetWidth;
				//log(e)

				const bcr = e.target.getBoundingClientRect();
				const x = e.targetTouches[0].clientX - bcr.x;
				let percent = x / totalW * 100;
				setSeekbarFill(percent);
				setSeekbarProgressNum(percent);
			}
			//log('touchmove');
		});
	}

}


const fadeInElements = () => {
	const sidebar = document.getElementById('sidebar');
	sidebar.style.opacity = 1;

	const topBarImage = document.querySelector('#topbar > .title-area > .image-cont');
	topBarImage.style.opacity = 1;

	const topBarTitleArea = document.querySelector('	#topbar > .title-area > .title-cont ');
	topBarTitleArea.style.opacity = 1;

	const rightSide = document.getElementById('right-side');
	rightSide.style.opacity = 1;
}


// Run on first page load
const initSettings = () => {
	showTopBarButtons(false);
	randomOn(); //toggle random on on default
	tileView = false;

	if (mobileViewEnabled) {
		viewVideoPlayer = false; //start mobile view with video hidden
	} 

	setToggleButtonStyles();
	setTrackView();
	setTopBarMargin();
	setListeners();

	// If url has parameters, use them to open playlist/track
	// Read params at initPlayerSettings(), player is ready then
	// With no params, on desktop open a default playlist
	// With no params, on mobile stay at playlists screen

	if (mobileViewEnabled) {
		darkTheme = true; //dark theme on default in mobile
		viewVideoPlayer = false;
		setVideoVisibility();
		showTitleArea();

		const rightSide = document.getElementById('right-side');
		rightSide.classList.add('hidden');

		const toggleSidebarButton = document.querySelector('#topbar > .title-area > .buttons > .button.toggle-sidebar');
		toggleSidebarButton.style.color = settings.toggleButtonColor.on;
	} else {
		// Open playlist on desktop automatically
		const playlistElems = document.querySelectorAll('#sidebar > .playlists > .playlist-item');
		const defaultPlaylist = playlistElems[2];
		defaultPlaylist.click()
	}
	
	setTrackViewBackgroundColor();
	fadeInElements();
}



const playVideo = () => { 
	musicIsPlaying = true;
	player.playVideo(); 
}
const pauseVideo = () => { 
	musicIsPlaying = false;
	player.pauseVideo(); 
}
const stopVideo = () => { 
	musicIsPlaying = false;
	player.stopVideo(); 
}

const mutePlayer = () => { 
	setVolume(0);
	player.mute();
}

const unmutePlayer = () => { 
	setVolume(prevVolume);
	player.unMute();
}
