/*******
	utilities.js
******/

var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var mobileWidth = 720; //the viewport width limit, if less use mobile view
var mobileViewEnabled = false;

const log = console.log;

if (viewportWidth <= mobileWidth) {
	$('#hide-video-mini').css('display','inline-block');
	mobileViewEnabled = true;
}

const ranNum = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const selectFrom = arr => {
  return arr[ranNum(0, arr.length-1)]; 
}



const sortByAttribute = (array, ...attrs) => {
  // generate an array of predicate-objects contains
  // property getter, and descending indicator
  let predicates = attrs.map(pred => {
    let descending = pred.charAt(0) === '-' ? -1 : 1;
    pred = pred.replace(/^-/, '');
    return {
      getter: o => o[pred],
      descend: descending
    };
  });
  // schwartzian transform idiom implementation. aka: "decorate-sort-undecorate"
  return array.map(item => {
    return {
      src: item,
      compareValues: predicates.map(predicate => predicate.getter(item))
    };
  })
  .sort((o1, o2) => {
    let i = -1, result = 0;
    while (++i < predicates.length) {
      if (o1.compareValues[i] < o2.compareValues[i]) result = -1;
      if (o1.compareValues[i] > o2.compareValues[i]) result = 1;
      if (result *= predicates[i].descend) break;
    }
    return result;
  })
  .map(item => item.src);
}

//returns the index of object with the specified value in a key
const findWithAttr = (array, attr, value) => {
  for (var i = 0; i < array.length; i++) {
      if(array[i][attr] === value) {
          return i;
      }
  }
  return -1;
}

const changeBgColor = (elem, color, shadowColor) => {
	$(elem).css('background-color',color);	
	$(elem).css('box-shadow','0px 0px 5px '+shadowColor);	
}

const changePageTitle = str => {
	$(document).attr("title", str);	
}

const changeBg = (elem, img) => {
	$(elem).css('background-image','url("'+img+'")');	
}

const moveElementY = (targetElem, yValue, duration) => {	
	anime({
	  targets: targetElem,
	  translateY: [
		{ value: yValue, duration: duration, easing:'easeOutQuad' },
	  ],
	});
}

const generateWordString = (word, amount) => {
  let str = '';

  for(let i=0; i<=amount; i++) {
    str += `${word} `
  }

  return str;
}


//scrollToTargetAdjusted function by Søren D. Ptæus: https://stackoverflow.com/a/49860927
const scrollToTargetAdjusted = targetElem => {

  const scrollElem = document.getElementById('right-side');
  const a = scrollElem.getBoundingClientRect();
  log(a)
  

  const playlistHeader = document.getElementById('playlist-info');
  const headerH = playlistHeader.offsetHeight;
  log(`headerH: ${headerH}`)
  const centerOffset = scrollElem.clientHeight / 2 //+ headerH;
  

  const elemTop = targetElem.offsetTop;
  const elemBot = elemTop + targetElem.clientHeight;

  const containerTop = scrollElem.scrollTop;
  const containerBot = containerTop + scrollElem.clientHeight;

  log(containerBot)

  let scroll = 0;

  if (elemTop < containerTop) {
      // Need to scroll up
      scroll = containerTop+headerH - elemTop - centerOffset;
      //scrollElem.scrollTop -= containerTop - elemTop - centerOffset;
      //scrollElem.scrollTop -= scroll;
      scroll = -1 * scroll;
     
  } else if (elemBot > containerBot) {
      // Need to scroll down

      scroll = elemBot - containerBot+200 + centerOffset;

      //scrollElem.scrollTop += elemBot - containerBot + centerOffset;
      //scrollElem.scrollTop += scroll;
  }

  //if (playlist.length > 1000) {
  if ( Math.abs(scroll) > 1000) {
    scrollElem.style.scrollBehavior = 'auto';
  } else {
    scrollElem.style.scrollBehavior = 'smooth';
  }

  scrollElem.scrollTop += scroll;


}


const isElementInViewport = el => {
  // Special bonus for those using jQuery
  if (typeof jQuery === "function" && el instanceof jQuery) {
      el = el[0];
  }
  var rect = el.getBoundingClientRect();
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
}

const isElementVisibleInContainer = (ele, container) => {
  const rect = ele.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return (
      rect.top >= containerRect.top &&
      rect.left >= containerRect.left &&
      rect.bottom <= containerRect.bottom &&
      rect.right <= containerRect.right
  );
};

const isElementVisibleInContainer2 = (ele, container) => {
  const rect = ele.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return (
      rect.top >= containerRect.top &&
      rect.left >= containerRect.left &&
      rect.bottom <= containerRect.bottom &&
      rect.right <= containerRect.right
  );
};

const isVisible = function (ele, container) {
  const eleTop = ele.offsetTop;
  const eleBottom = eleTop + ele.clientHeight;

  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight - 500;

  // The element is fully visible in the container
  return (
      (eleTop >= containerTop && eleBottom <= containerBottom-200) ||
      // Some part of the element is visible in the container
      (eleTop < containerTop && containerTop < eleBottom) ||
      (eleTop < containerBottom-200 && containerBottom-200 < eleBottom)
  );
};

/* scrollToBeVisible function source: 
https://phuoc.ng/collection/html-dom/scroll-an-element-to-ensure-it-is-visible-in-a-scrollable-container/
*/
const scrollToBeVisible = function (ele, container) {
  const eleTop = ele.offsetTop;
  const eleBottom = eleTop + ele.clientHeight;

  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;

  if (eleTop < containerTop) {
      // Scroll to the top of container
      container.scrollTop -= containerTop - eleTop;
  } else if (eleBottom > containerBottom) {
      // Scroll to the bottom of container
      container.scrollTop += eleBottom - containerBottom;
  }
};

const adjustPlaylistHeaderColors = colorArr => {
  //let [r, g, b] = [...colorArr];
  let adjustedColors = [];

  for (let color of colorArr) {
    if (color > 100) {
      color = 100;
    }
    adjustedColors.push(color);
  }

  return adjustedColors;
}

//check if any tracks have same artist and same name
//by Faisal Sayed: https://stackoverflow.com/a/61463426
const dupeCheck = (data) => {
	//let test = {artist:'Gamma Ray', name:'Solid'}; //test dupe tracks
	//data.tracks.push(test);

	let arr = data.tracks;

	var result = arr.reduce((retArr, item) => {
	// condition to avoid duplication
	if (!retArr.includes(item)) {
		var filteredArr = arr.filter((i) => {
		return i.artist === item.artist && i.name === item.name;
		});
		if (filteredArr.length > 1) retArr = [...retArr, ...filteredArr];
	}
	return retArr;
	}, []);

	if (result.length > 0) {
		let str = `FOUND ${result.length} DUPLICATE TRACKS (dupeCheck, index.js):`
		log(str);
		log(result);
	}
}

// Extract video id from longer Youtube urls
const processYoutubeIds = data => {
	for (const track of data.tracks) {   
		let yt = track.yt;

		if (yt != null && yt.length > 11) { //youtube video id's are 11 chars long
			if (yt.indexOf("youtu.be/") >= 0) { // https://youtu.be/nda20uSjQUI
				yt = yt.substr(yt.indexOf("youtu.be/")+"youtu.be/".length, 11)
			} else if (yt.indexOf("watch?v=") >= 0) { // https://www.youtube.com/watch?v=nda20uSjQUI
				yt = yt.substr(yt.indexOf("watch?v=")+"watch?v=".length, 11)
			}
		}
		track.yt = yt; 	//yt is video id only for now
	}

	musicData = data; //store to global variable
}