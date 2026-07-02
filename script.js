const button = document.getElementById('btn');
const input = document.getElementById('input');

button.addEventListener('click', () => {
        chrome.bookmarks.search(input.value, function(results) {
        console.log(results);
    })
});


