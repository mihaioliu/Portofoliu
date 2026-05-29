const GITHUB_USERNAME = "mihaioliu";

const repoList = document.getElementById("repo-list");
const searchInput = document.getElementById("search-input");
const languageFilter = document.getElementById("language-filter");
const sortSelect = document.getElementById("sort-select");

// Creează spinnerul (sau după preferință schelet, poți folosi și SVG-uri custom)
function showLoading() {
  repoList.innerHTML = `
    <div class="spinner"></div>
    <div style="color:#888; font-size:1.09em; margin-top:0.7em; margin-bottom:1.2em;">
      Se încarcă proiectele...
    </div>
  `;
}

function hideLoading() {
  repoList.innerHTML = "";
}

function showError(message) {
  repoList.innerHTML = `<div class="error-message">${message}</div>`;
}

let allRepos = [];
let filteredRepos = [];

function renderRepoCards(repos) {
  repoList.innerHTML = "";
  if (repos.length === 0) {
    repoList.innerHTML = "<p style='color:#888'>Niciun proiect găsit.</p>";
    return;
  }
  repos.forEach(repo => {
    const card = document.createElement("div");
    card.className = "github-card";
    card.innerHTML = `
      <h3>
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
      </h3>
      <p>${repo.description ? repo.description : "<span style='color:#888'>Fără descriere disponibilă</span>"}</p>
      <p><strong>Limbaj principal:</strong> ${repo.language ? repo.language : "Nespecificat"}</p>
      <div style="font-size: 0.95em; margin-bottom: 10px;">
        ⭐ ${repo.stargazers_count}
        &nbsp;&nbsp;|&nbsp;&nbsp;
        🍴 ${repo.forks_count}
      </div>
      <a href="${repo.html_url}" target="_blank" class="button">Vezi pe GitHub</a>
    `;
    repoList.appendChild(card);
  });
}

function populateLanguageFilter(repos) {
  const langs = new Set();
  repos.forEach(repo => {
    if (repo.language) langs.add(repo.language);
  });
  languageFilter.innerHTML = '<option value="">Toate limbajele</option>';
  [...langs].sort().forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang;
    languageFilter.appendChild(opt);
  });
}

function sortRepos(repos) {
  const sortBy = sortSelect ? sortSelect.value : "updated";
  if (sortBy === "stars") {
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } else {
    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }
  return repos;
}

function applyFiltersAndRender() {
  let repos = allRepos;

  if (languageFilter && languageFilter.value) {
    repos = repos.filter(repo => repo.language === languageFilter.value);
  }
  if (searchInput && searchInput.value.trim()) {
    const searchTerm = searchInput.value.trim().toLowerCase();
    repos = repos.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm))
    );
  }
  repos = sortRepos(repos);

  filteredRepos = repos;
  renderRepoCards(filteredRepos);
}

// === Apel API cu feedback vizual loading/error handling îmbunătățit ===
showLoading();
fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`)
  .then(async response => {
    if (!response.ok) {
      let msg = "Ups! Nu am putut încărca proiectele momentan.";
      // error pentru ratelimiting, user inexistent etc.
      if (response.status === 404) msg = "Utilizatorul GitHub nu există.";
      if (response.status === 403) msg = "S-a atins limita de request-uri GitHub. Încearcă mai târziu.";
      throw new Error(msg);
    }
    return response.json();
  })
  .then(repos => {
    allRepos = repos.filter(repo => !repo.fork);
    allRepos = sortRepos(allRepos);
    populateLanguageFilter(allRepos);
    applyFiltersAndRender();
  })
  .catch(error => {
    showError(error.message || "Ups! Nu am putut încărca proiectele momentan.");
    console.error("Eroare la fetch:", error);
  });

// Reaplica filtrul dacă utilizatorul tastează/alege opțiuni
if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);
if (languageFilter) languageFilter.addEventListener("change", applyFiltersAndRender);
if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndRender);