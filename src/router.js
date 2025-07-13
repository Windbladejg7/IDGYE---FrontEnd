import renderLoginView from "./views/loginView.js";
import renderInicio from "./views/inicioView.js";
import renderCursosView from "./views/cursosView.js";
import renderPruebasView from "./views/pruebasView.js";

export async function router(pathname) {
  const app = document.getElementById("app");

  const routes = {
    "/": renderLoginView,
    "/home": renderInicio,
    "/cursos": renderCursosView
  };

  const render = routes[pathname] || (() => app.innerHTML = `<h1>404</h1>`);
  await render();
}