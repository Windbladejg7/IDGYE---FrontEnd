import renderEditorView from "./views/editorView.js";
import renderLoginView from "./views/loginView.js";
import renderInicio from "./views/inicioView.js";

export async function router(pathname) {
  const app = document.getElementById("app");

  const routes = {
    "/": renderLoginView,
    "/home": renderInicio
  };

  const render = routes[pathname] || (() => app.innerHTML = `<h1>404</h1>`);
  await render();
}