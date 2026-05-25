// 1. Completează cu username-ul tău real de GitHub!
const GITHUB_USERNAME = "mihaioliu"; 

// 2. Selectează containerul unde vor fi inserate cardurile
const repoList = document.getElementById("repo-list");

// 3. Ia datele repo-urilor de pe GitHub (primii 5, sortate după data ultimei actualizări)
fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=5`)
  .then(response => response.json())
  .then(repos => {
    // 4. Pentru fiecare repo, construiește un card și inserează-l în pagină
    repos.forEach(repo => {
      // Cardul pentru un proiect
      const card = document.createElement("div");
      card.style.border = "1px solid #ccc";
      card.style.padding = "12px";
      card.style.marginBottom = "16px";
      card.style.borderRadius = "10px";
      card.style.background = "white";

      card.innerHTML = `
        <h3 style="margin: 0 0 10px 0;">
          <a href="${repo.html_url}" target="_blank" style="text-decoration: none; color: #0070f3;">
            ${repo.name}
          </a>
        </h3>
        <p style="margin: 0 0 8px 0;">${repo.description ? repo.description : "Fără descriere"}</p>
        <small>Limbaj: <strong>${repo.language ? repo.language : "Nespecificat"}</strong></small>
      `;
      repoList.appendChild(card);
    });
  })
  .catch(error => {
    repoList.innerHTML = "<p style='color:red'>A apărut o eroare la preluarea proiectelor.</p>";
    console.error("Eroare la fetch:", error);
  });