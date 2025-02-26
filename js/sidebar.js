//sidebar.js


// Create spotify-style sidebar with playlists

const createSidebarPlaylists = () => {
    const target = document.querySelector('#sidebar > .playlists');


    for (const [key, list] of playlists.entries()) {

        const elem = document.createElement('div');
        elem.classList.add('playlist-item');
        elem.setAttribute('data-name', list.name);

        const imageCont = document.createElement('div');
        imageCont.classList.add('image-cont');

        const layerLight = document.createElement('div');
        layerLight.classList.add('layer');
        layerLight.classList.add('light');
        imageCont.append(layerLight);
        
        const layerDark = document.createElement('div');
        layerDark.classList.add('layer');
        layerDark.classList.add('dark');
        imageCont.append(layerDark);

        const image = document.createElement('img');
        image.classList.add('image');
        image.src = list.imageSmall;
        imageCont.append(image);

        const infoCont = document.createElement('div');
        infoCont.classList.add('info-cont');

        const name = document.createElement('div');
        name.classList.add('name');
        name.innerText = list.name;
        infoCont.append(name);

        const trackAmount = document.createElement('div');
        trackAmount.classList.add('track-amount');



        trackAmount.innerText = `${list.tracks.length} tracks`;
        infoCont.append(trackAmount);

      
        elem.append(imageCont);
        elem.append(infoCont);
        target.append(elem);

    }

    target.addEventListener('click', e => {
		const clickedElem = e.target;
		if (clickedElem.classList.contains('playlist-item')) {
			const name = clickedElem.getAttribute('data-name');
            selectPlaylist(name);

            const prevSelection = document.querySelector('#sidebar > .playlists > .playlist-item.selected');
            if (prevSelection !== undefined && prevSelection !== null) {
                prevSelection.classList.remove('selected');
            }

            clickedElem.classList.add('selected');
          
		}
	});
}

