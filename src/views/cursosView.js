import renderPruebasView from "./pruebasView";
import renderAdminLoginView from "./adminLoginView";

export default async function renderCursosView() {
  const usuario = document.getElementById("usuario");
  usuario.textContent = localStorage.getItem("usuario");

  document.getElementById("homeTab").href = "/cursos";
  usuario.style.cursor = "pointer";
  usuario.addEventListener("click", () => {
    history.pushState(null, "", "/admin");
    renderAdminLoginView();
  });


  const cursos = await obtenerMisCursos();
  const app = document.getElementById("app");

  app.innerHTML = `
    <nav id="cursosHeader">
      <h1>Mis cursos</h1>
    </nav>
    <div id="mainCursos">
      <div id="cursosContainer"></div>
    </div>
  `;

  const cursosContainer = document.getElementById("cursosContainer");

  if (cursos.length > 0) {
    for (let curso of cursos) {
      const card = document.createElement("div");
      card.classList.add("curso-card");
      card.textContent = curso.nombre;

      card.addEventListener("click", async () => {
        history.pushState(null, "", "/pruebas");
        await renderPruebasView(curso);
      });

      cursosContainer.appendChild(card);
    }
  } else {
    cursosContainer.innerHTML = `<p class="mensaje-vacio">Sin cursos disponibles</p>`;
  }
}

async function obtenerMisCursos() {
  const response = await fetch("https://idgye.onrender.com/api/cursos", {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
  return await response.json();
}