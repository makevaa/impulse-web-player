
const searchFromPlaylist = () => {


  if (trackView) {
    trackViewOff();
  }


  const input = document.getElementById('search');
  const filter = input.value.toUpperCase();
  const elems = document.querySelectorAll('#track-items > .item');

  //item elems have searchstring attribute

  // Loop through all list items, and hide those who don't match the search query
  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i];
    const elemString = elem.getAttribute('searchstring');

    if (elemString.toUpperCase().indexOf(filter) > -1) {
      elem.style.display = "";
    } else {
      elem.style.display = "none";
    }
  }
}

const clearSearchBar = () => {
  document.getElementById('search').value = '';
  //searchFromPlaylist(); //search with empty field to show all tracks again
  //show all tracks again
  const elems = document.querySelectorAll('.item');
  for (let i = 0; i < elems.length; i++) {
    elems[i].style.display = "";
  }
}

const showSearchBar = (show=true) => {
  const searchBar = document.getElementById('search-container');
  const titleImage = document.querySelector('#topbar > .mid > .mobile-title-image-cont');
  if (show) {
    titleImage.style.display = 'none';
    searchBar.style.display = 'inline-flex';
   
  } else {
    searchBar.style.display = 'none';
    titleImage.style.display = 'flex';
  }


}