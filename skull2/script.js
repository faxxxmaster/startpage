// Theme Switcher
const themeSwitcher = document.getElementById('theme-switcher');
const body = document.body;
const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);
themeSwitcher.addEventListener('click', () => {
  const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// DateTime
function updateDateTime() {
  const now = new Date();
  const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('current-datetime').innerHTML =
    `<span class="datetime-date">${date}</span><span class="datetime-time">${time}</span>`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Search & Toggle Logic
const searchTextEl = document.getElementById('search-text');
let searchQuery = '';
let searchMode = 'google';
const searchToggle = document.getElementById('search-toggle');
const switchLabels = searchToggle.querySelectorAll('.switch-label');
searchToggle.setAttribute('data-mode', searchMode);
switchLabels[0].classList.add('active');

searchToggle.addEventListener('click', () => {
  searchMode = searchMode === 'google' ? 'links' : 'google';
  searchToggle.setAttribute('data-mode', searchMode);
  switchLabels.forEach(l => l.classList.remove('active'));
  (searchMode === 'google' ? switchLabels[0] : switchLabels[1]).classList.add('active');
  if (searchMode === 'google') {
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('hidden'));
    document.querySelectorAll('.link-item').forEach(l => l.classList.remove('hidden'));
  }
});

function isValidUrl(str) {
  return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(str);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' || e.key === 'Enter' || e.key.length === 1) e.preventDefault();
  if (e.key === 'Backspace') searchQuery = searchQuery.slice(0, -1);
  else if (e.key === 'Enter') {
    const q = searchQuery.trim();
    if (q) {
      if (searchMode === 'google') {
        window.location.href = isValidUrl(q)
          ? (q.startsWith('http') ? q : `http://${q}`)
          : `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      } else {
        filterLinks(q);
      }
    } else {
      resetFilters();
    }
    searchQuery = '';
  } else if (e.key.length === 1) {
    searchQuery += e.key;
  }
  searchTextEl.textContent = searchQuery;
});

function filterLinks(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.category-card').forEach(cat => {
    let match = false;
    const title = cat.querySelector('.category-title').textContent.toLowerCase();
    if (title.includes(q)) match = true;
    cat.querySelectorAll('.link-item').forEach(link => {
      const textMatch = link.textContent.toLowerCase().includes(q);
      const urlMatch = link.href.toLowerCase().includes(q);
      link.classList.toggle('hidden', !(textMatch || urlMatch));
      if (textMatch || urlMatch) match = true;
    });
    cat.classList.toggle('hidden', !match);
  });
}

function resetFilters() {
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('hidden'));
  document.querySelectorAll('.link-item').forEach(l => l.classList.remove('hidden'));
}

// AI Dropdown
const aiTrigger = document.querySelector('.ai-trigger');
const aiDropdown = document.getElementById('ai-dropdown');
aiTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = aiDropdown.classList.toggle('open');
  aiTrigger.classList.toggle('active', open);
});
document.addEventListener('click', () => {
  aiDropdown.classList.remove('open');
  aiTrigger.classList.remove('active');
});

if (typeof config !== 'undefined' && config.aiTools) {
  config.aiTools.forEach(tool => {
    const a = document.createElement('a');
    a.href = tool.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.innerHTML = `<span>${tool.name}</span> ${tool.title}`;
    aiDropdown.appendChild(a);
  });
}

// Render Bookmarks
function renderBookmarks() {
  const container = document.getElementById('bookmarks');
  const linksPerPage = 8;

  config.categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    const header = document.createElement('div');
    header.className = 'category-header';

    const title = document.createElement('span');
    title.className = 'category-title';
    title.textContent = cat.title;

    const pag = document.createElement('div');
    pag.className = 'pagination-controls';

    const prev = document.createElement('button');
    prev.className = 'page-arrow prev'; prev.textContent = '‹';
    const counter = document.createElement('span');
    counter.className = 'page-counter';
    const next = document.createElement('button');
    next.className = 'page-arrow next'; next.textContent = '›';

    pag.append(prev, counter, next);
    header.append(title, pag);

    const list = document.createElement('div');
    list.className = 'links-list';

    let page = 0;
    const totalPages = Math.ceil(cat.links.length / linksPerPage) || 1;

    const render = () => {
      counter.textContent = `${page + 1}/${totalPages}`;
      prev.classList.toggle('disabled', page === 0);
      next.classList.toggle('disabled', page >= totalPages - 1);
      list.innerHTML = '';

      const start = page * linksPerPage;
      cat.links.slice(start, start + linksPerPage).forEach(l => {
        const a = document.createElement('a');
        a.href = l.url; a.className = 'link-item'; a.textContent = l.name;
        a.target = '_blank'; a.rel = 'noopener noreferrer';
        list.appendChild(a);
      });
    };

    prev.addEventListener('click', () => { if (page > 0) { page--; render(); } });
    next.addEventListener('click', () => { if (page < totalPages - 1) { page++; render(); } });

    render();
    card.append(header, list);
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderBookmarks);