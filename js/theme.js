
/*

const themes = {
	defaultTheme: {
		//pageBg:"#2b2f34",
		pageBg:"black",
		playerBg:"rgba(10,10,13,0.93)",
		playerBorder:"black",
		artistColor:"#d9d9d9",
		trackColor:"#b3b3b3",
		playerAreaTextShadows:"2px"
	},
	youtubeDark: {
		pageBg:"#030303",
		playerBg:"#09090c",
		playerBorder:"#383838",		
		artistColor:"#ffffff",
		trackColor:"#b4b4b4",
		playerAreaTextShadows:"1px"
	}
}

const changeTheme = theme => {
	return false;
	$('body').css('background-color', theme.pageBg);
	$('#player-area').css('background-color', theme.playerBg);
	//$('#player-area').css('border-top', '1px solid ' + theme.playerBorder);
	//$('#player-area').css('border-top', '1px solid ' + theme.playerBorder);
	$('#icon-list > .item > .info > .artist').css('color', theme.artistColor);
	$('#icon-list > .item > .info > .track').css('color', theme.trackColor);
	
	//text-shadow: 1px 1px 0px black;
	$('#btn-mute, .toggle-button, #vol-indicator, #track-name').css('text-shadow', theme.playerAreaTextShadows + " " + theme.playerAreaTextShadows + " 0px black");
	
}

const setThemeState = () => {
	setToggleButtonStyles();
	
	if (darkTheme) {
		changeTheme(themes.youtubeDark);
	} else {
		//default color theme
		changeTheme(themes.defaultTheme);
	}	   
}

const toggleTheme = () => {
	darkTheme = !darkTheme;
	setThemeState();	
}

*/