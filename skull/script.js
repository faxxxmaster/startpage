// Theme switcher functionality
const themeSwitcher = document.getElementById('theme-switcher');
const themeIcon = document.querySelector('.theme-icon');
const body = document.body;

// Check for saved theme or default to 'dark'
const currentTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeSwitcher.title = theme === 'dark' ? 'Helles Theme aktivieren' : 'Dunkles Theme aktivieren';
}

themeSwitcher.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Function to update the clock and date
function updateDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('de-DE', options);

    document.getElementById('current-datetime').textContent = `${dateString} ${timeString}`;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Search bar functionality
const searchTextElement = document.getElementById('search-text');
const blinkerElement = document.getElementById('blinker');
let searchQuery = '';

function isValidUrl(string) {
    const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;
    return urlRegex.test(string);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' || event.key === 'Enter' || event.key.length === 1) {
        event.preventDefault();
    }

    if (event.key === 'Backspace') {
        searchQuery = searchQuery.slice(0, -1);
    } else if (event.key === 'Enter') {
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery !== '') {
            if (isValidUrl(trimmedQuery)) {
                let urlToOpen = trimmedQuery;
                if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
                    urlToOpen = `http://${urlToOpen}`;
                }
                window.location.href = urlToOpen;
            } else {
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`;
            }
        }
        searchQuery = '';
    } else if (event.key.length === 1) {
        searchQuery += event.key;
    }
    searchTextElement.textContent = searchQuery;
});

// Pagination for links functionality
document.addEventListener('DOMContentLoaded', () => {
    const categories = document.querySelectorAll('.category');
    const linksPerPage = 6;

    categories.forEach(category => {
        const linksContainer = category.querySelector('.links');
        const allLinkElements = Array.from(linksContainer.querySelectorAll('li:not(.title)'));

        category.allOriginalLinks = allLinkElements;
        category.currentPage = 0;

        const toggleButton = category.querySelector('.toggle-links-button');

        function displayCurrentPage(currentCategory) {
            const allLinks = currentCategory.allOriginalLinks;
            const currentPage = currentCategory.currentPage;
            const startIndex = currentPage * linksPerPage;
            const endIndex = startIndex + linksPerPage;

            allLinks.forEach(link => link.style.display = 'none');

            for (let i = startIndex; i < endIndex && i < allLinks.length; i++) {
                allLinks[i].style.display = 'list-item';
            }

            if (allLinks.length <= linksPerPage) {
                toggleButton.style.display = 'none';
            } else {
                toggleButton.style.display = 'block';
            }
        }

        displayCurrentPage(category);

        toggleButton.addEventListener('click', () => {
            category.currentPage++;
            if (category.currentPage * linksPerPage >= category.allOriginalLinks.length) {
                category.currentPage = 0;
            }
            displayCurrentPage(category);
        });
    });
});
