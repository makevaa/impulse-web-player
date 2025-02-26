//preload.js: read imgur image ids from defaultImages (index.js), build urls and push to imagesToPreload.list, then preload them

/*
const imagesToPreload = {
   

    list:[],
    createImageList: () => {
        for (const id of defaultImages) { 
            imagesToPreload.list.push(`https://i.imgur.com/${id}.jpg`);
        }
    }
}
imagesToPreload.createImageList();
*/

const preloadImages = srcs => {
    //log(musicData)
    function loadImage(src) {
        return new Promise(function(resolve, reject) {
            var img = new Image();
            img.onload = function() {
                resolve(img);
            };
            img.onerror = img.onabort = function() {
                reject(src);
            };
            img.src = src;
        });
    }

    var promises = [];
    for (var i = 0; i < srcs.length; i++) {
        promises.push(loadImage(srcs[i]));
    }
    return Promise.all(promises);
}




const preload = (data) => {
    //log(data)
    //preload playlist images
    //could also preload other images, like the default "no image" track images
    const imagesToPreload = [];
    const playlistImages = [];

    for (const playlist of data.playlists) {
        const image = playlist.image;
        playlistImages.push(image);
    }

    imagesToPreload.concat(playlistImages);

    preloadImages(imagesToPreload).then(function(imgs) {
        // all images are loaded now and in the array imgs
        log("images preloaded (preload.js)");
        //init();
    }, function(errImg) {
        // at least one image failed to load
        log(`failed to preload image: ${errImg} (preload.js)`);
    });
}

