const GITHUB_USERNAME = "mihaioliu"; // pune username-ul tău, dacă nu e deja

const repoList = document.getElementById("repo-list");

fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=5`)
  .then(response => response.json())
  .then(repos => {
    repoList.innerHTML = ""; // goliți înainte, ca să nu se adune la fiecare refresh
    repos.forEach(repo => {
      const card = document.createElement("div");
      card.style.border = "1px solid #bbb";
      card.style.padding = "14px";
      card.style.marginBottom = "18px";
      card.style.borderRadius = "10px";
      card.style.background = "#fff";
      card.style.boxShadow = "0 2px 8px #eee";
      
      card.innerHTML = `
        <h3 style="margin: 0 0 8px 0;">
          <a href="${repo.html_url}" target="_blank" style="color: #0066cc; text-decoration: none;">
            ${repo.name}
          </a>
        </h3>
        <p style="margin: 0 0 8px 0;">
          ${repo.description ? repo.description : "<span style='color:#888'>Fără descriere disponibilă</span>"}
        </p>
        <p style="margin: 0 0 6px 0;">
          <strong>Limbaj principal:</strong> ${repo.language ? repo.language : "Nespecificat"}
        </p>
        <div style="font-size: 0.95em; margin-bottom: 10px;">
          ⭐ ${repo.stargazers_count}  
          &nbsp;&nbsp;|&nbsp;&nbsp;
          🍴 ${repo.forks_count}
        </div>
        <a href="${repo.html_url}" target="_blank" style="display:inline-block; padding:6px 16px; background:#0070f3; color:#fff; border-radius:6px; text-decoration:none;">
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