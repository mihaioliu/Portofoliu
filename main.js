const GITHUB_USERNAME = "mihaioliu"; // pune username-ul tău, dacă nu e deja

const repoList = document.getElementById("repo-list");

fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=5`)
  .then(response => response.json())
  .then(repos => {
    repoList.innerHTML = "";
    repos.forEach(repo => {
      const card = document.createElement("div");
      card.className = "github-card";
      card.innerHTML = `
        <h3>
          <a href="${repo.html_url}" target="_blank">
            ${repo.name}
          </a>
        </h3>
        <p>
          ${repo.description ? repo.description : "<span style='color:#888'>Fără descriere disponibilă</span>"}
        </p>
        <p>
          <strong>Limbaj principal:</strong> ${repo.language ? repo.language : "Nespecificat"}
        </p>
        <div style="font-size: 0.95em; margin-bottom: 10px;">
          ⭐ ${repo.stargazers_count}  
          &nbsp;&nbsp;|&nbsp;&nbsp;
          🍴 ${repo.forks_count}
        </div>
        <a href="${repo.html_url}" target="_blank" class="button">
          Vezi pe GitHub
        </a>
      `;
      repoList.appendChild(card);
    });
  })
  .catch(error => {
    repoList.innerHTML = "<p style='color:red'>A apărut o eroare la preluarea proiectelor.</p>";
    console.error("Eroare la fetch:", error);
  });