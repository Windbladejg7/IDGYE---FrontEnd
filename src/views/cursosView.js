import renderPruebasView from "./pruebasView";

export default async function renderCursosView() {
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
        await renderPruebasView(curso);
      });

      cursosContainer.appendChild(card);
    }
  } else {
    cursosContainer.innerHTML = `<p class="mensaje-vacio">Sin cursos disponibles</p>`;
  }
}

async function obtenerMisCursos() {
  const response = await fetch("http://localhost:3000/api/cursos", {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
  return await response.json();
}