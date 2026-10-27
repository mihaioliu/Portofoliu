const GITHUB_USERNAME = "mihaioliu";

// 🔍 Detectează repo-ul
const isGitHubPages = window.location.hostname.includes('github.io');
const repoName = window.location.pathname.split('/')[1]; // Extrage repo din URL
const basePath = isGitHubPages && repoName ? `/${repoName}/` : './';

console.log("🔍 BASE PATH:", basePath);
console.log("🔍 IS GITHUB PAGES:", isGitHubPages);
console.log("🔍 REPO NAME:", repoName);

const repoList = document.getElementById("repo-list");
const searchInput = document.getElementById("search-input");
const languageFilter = document.getElementById("language-filter");
const sortSelect = document.getElementById("sort-select");

function showLoading() {
  if (!repoList) return;
  repoList.innerHTML = `
    <div class="spinner"></div>
    <div style="color:#888; font-size:1.09em; margin-top:0.7em; margin-bottom:1.2em;">
      Se încarcă proiectele...
    </div>
  `;
}

function hideLoading() {
  if (repoList) repoList.innerHTML = "";
}

function showError(message) {
  if (repoList) repoList.innerHTML = `<div class="error-message">${message}</div>`;
}

let allRepos = [];
let filteredRepos = [];

function renderRepoCards(repos) {
  if (!repoList) return;
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
  if (!languageFilter) return;
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

// 🔥 Funcție pentru a citi projects.json
function loadFallbackProjects() {
  return fetch(`${basePath}projects.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error("❌ Eroare la citirea projects.json:", error);
      return [];
    });
}

// === Apel API cu fallback handling (Rulează doar pe pagina de proiecte) ===
if (repoList) {
  showLoading();
  fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`)
    .then(async response => {
      if (!response.ok) {
        let msg = "Ups! Nu am putut încărca proiectele momentan.";
        if (response.status === 404) msg = "Utilizatorul GitHub nu există.";
        if (response.status === 403) msg = "S-a atins limita de request-uri GitHub. Încearcă mai târziu.";
        throw new Error(msg);
      }
      return response.json();
    })
    .then(repos => {
      allRepos = repos.filter(repo => !repo.fork && repo.name !== 'Portofoliu');
      console.log("Proiecte GitHub:", allRepos.length);
      
      if (allRepos.length < 5) {
        console.log("Se adaugă proiecte de fallback...");
        return loadFallbackProjects().then(fallbackProjects => {
          allRepos = allRepos.concat(fallbackProjects);
          return allRepos;
        });
      }
      return allRepos;
    })
    .then(repos => {
      allRepos = sortRepos(repos);
      populateLanguageFilter(allRepos);
      applyFiltersAndRender();
    })
    .catch(error => {
      showError(error.message || "Ups! Nu am putut încărca proiectele momentan.");
      console.error("Eroare la fetch:", error);
    });

  if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);
  if (languageFilter) languageFilter.addEventListener("change", applyFiltersAndRender);
  if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndRender);
}


/* ==========================================================================
   📬 CONTACT FORM VALIDATION & ACCESSIBILITY (Accesibil & Cu Stări Completes)
   ========================================================================== */


   document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    if (!form) return;
  
    const statusContainer = document.getElementById("form-status");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    function setFieldError(field, errorMessage) {
      const errorElement = document.getElementById(`${field.id}-error`);
  
      if (errorMessage) {
        field.setAttribute("aria-invalid", "true");
        field.classList.add("input-error");
  
        if (errorElement) {
          errorElement.textContent = errorMessage;
          errorElement.style.display = "block";
        }
      } else {
        field.setAttribute("aria-invalid", "false");
        field.classList.remove("input-error");
  
        if (errorElement) {
          errorElement.textContent = "";
          errorElement.style.display = "none";
        }
      }
    }
  
    function validateField(field) {
      const value = field.value.trim();
      let errorMessage = "";
  
      if (field.required && value === "") {
        errorMessage = "Acest câmp este obligatoriu.";
      } else if (
        field.type === "email" &&
        value !== "" &&
        !emailRegex.test(value)
      ) {
        errorMessage = "Introdu o adresă de e-mail validă.";
      } else if (
        field.minLength > 0 &&
        value.length < field.minLength
      ) {
        errorMessage = `Textul trebuie să aibă cel puțin ${field.minLength} caractere.`;
      }
  
      setFieldError(field, errorMessage);
      return errorMessage === "";
    }
  
    const fields = form.querySelectorAll("input, textarea");
  
    fields.forEach(field => {
      field.addEventListener("blur", () => validateField(field));
  
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      });
    });
  
    // Gestionare Submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      let isFormValid = true;
      let firstInvalidField = null;
  
      fields.forEach(field => {
        if (!validateField(field)) {
          isFormValid = false;
  
          if (!firstInvalidField) {
            firstInvalidField = field;
          }
        }
      });
  
      if (!isFormValid) {
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }
  
      // Adresa ta de e-mail
      const recipient = "oliumihai@gmail.com";
  
      // Preluarea datelor din formular
      const name = form.elements["name"].value.trim();
      const email = form.elements["email"].value.trim();
      const subject = form.elements["subject"].value.trim();
      const message = form.elements["message"].value.trim();
  
      // Construirea mesajului
      const body =
        `Nume: ${name}\n` +
        `E-mail expeditor: ${email}\n\n` +
        `Mesaj:\n${message}`;
  
      // Deschiderea aplicației de e-mail cu datele completate
      const mailtoLink =
        `mailto:${recipient}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;
  
      if (statusContainer) {
        statusContainer.className = "form-status";
        statusContainer.textContent =
          "Se deschide aplicația de e-mail...";
      }
  
      //window.location.href = mailtoLink; // functia pentru trimitere mail
      console.log("Formular valid. Se deschide e-mailul:", mailtoLink);
window.open(mailtoLink, "_self");
    });
  });
  
