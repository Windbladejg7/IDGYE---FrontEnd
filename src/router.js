import renderLoginView from "./views/loginView.js";
import renderInicio from "./views/inicioView.js";
import renderCursosView from "./views/cursosView.js";
import renderEntregasView from "./views/entregasView.js";
import renderAdminLoginView from "./views/adminLoginView.js";
import renderEditorView from "./views/editorView.js";
import renderPruebasView from "./views/pruebasView.js";


export async function router(pathname) {
  const app = document.getElementById("app");

  const routes = {
    "/": renderLoginView,
    "/home": renderInicio,
    "/cursos": renderCursosView,
    "/adminLogin": renderAdminLoginView,
    "/entregas": async()=> await renderEntregasView(JSON.parse(localStorage.getItem("prueba")), localStorage.getItem("id_curso")),
    "/editor": async ()=> await renderEditorView(JSON.parse(localStorage.getItem("prueba"))),
    "/pruebas": async ()=> await renderPruebasView(JSON.parse(localStorage.getItem("curso")))
  };

  const render = routes[pathname] || (() => app.innerHTML = `<h1>404</h1>`);
  await render();
}