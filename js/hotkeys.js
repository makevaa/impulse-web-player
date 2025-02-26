//ctrl-F to focus search bar
window.addEventListener("keydown", (e) => {
    if (e.code === 'F3' || ((e.ctrlKey || e.metaKey) && e.code === 'KeyF')) { 
      e.preventDefault();
      const search = document.getElementById('search')
      search.focus()
    }
  })