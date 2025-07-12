import * as monaco from "monaco-editor";
import { run } from "../handlers.js";
import themeData from "monaco-themes/themes/Dracula.json";

export default async function renderEditorView() {
  const app = document.getElementById("app");
  app.innerHTML = `
  <nav id="headerEditor">
  <button id="btnEjecutar"><i class="fa-solid fa-play"></i></button>
  <button id="btnEnviar">Enviar</button></nav>
    <main>
      <section id="containerExplorer">
      <ul id="leftMenu">
      <li id="tabDescripcion">Descripción</li>
      <li id="tabArchivos">Archivos</li>
      </ul>
      <nav id="explorer"></nav>
      </section>
      <section id="codingArea">
        <nav id="topBar">
          <i class="fa-solid fa-code"></i>
        </nav>
        <div id="editor"></div>
        <div id="console"></div>
      </section>
      <ul class="menuBurbuja" id="menuFlotante" style="display: none;"></ul>
    </main>
  `;

  const explorer = document.getElementById("explorer");
  const menuFlotante = document.getElementById("menuFlotante");
  const runCode = document.getElementById("btnEjecutar");
  const consola = document.getElementById("console");
  const tabDescripcion = document.getElementById("tabDescripcion");
  const tabArchivos = document.getElementById("tabArchivos");

  monaco.editor.defineTheme("github", themeData);
  monaco.editor.setTheme("github");

  const editor = monaco.editor.create(document.getElementById("editor"), {
    language: "javascript",
    theme: "github",
    fontFamily: "JetBrains Mono"
  });

  editor.setValue(`console.log("Hello, World!");`);

  runCode.addEventListener("click", async () => {
    const result = await run(editor.getValue());
    consola.textContent = result.stdout;
  });

  function renderTree(node, parent) {
    if (node.type === "file") {
      const a = document.createElement("li");
      a.innerHTML = `  <i class="fa-solid fa-file-code"></i> ${node.name}`;
      a.classList.add(node.type);
      a.addEventListener("click", () => {
        editor.setValue(node.content);
      });

      a.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });

      parent.appendChild(a);
    }

    document.addEventListener("click", (e) => {
      if (e.target !== menuFlotante) {
        menuFlotante.style.display = "none";
      }
    });

    const element = document.createElement("div");

    if (node.type === "folder") {
      const inner = document.createElement("div");
      inner.innerHTML = `<i class="fas fa-folder"></i> ${node.name}`;
      inner.classList.add(node.type);
      element.appendChild(inner);
      parent.prepend(element);
      inner.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        menuFlotante.style.display = "flex";
        menuFlotante.style.left = e.clientX + "px";
        menuFlotante.style.top = e.clientY + "px";
        menuFlotante.classList.add("menuBurbuja");
        menuFlotante.innerHTML = "";
        const opt = document.createElement("li");
        opt.textContent = "Nuevo archivo..."
        menuFlotante.appendChild(opt);
      });

      if (node.children) {
        const lista = document.createElement("ul");
        element.appendChild(lista);
        lista.style.marginLeft = "5px";

        inner.addEventListener("click", () => {
          lista.classList.toggle("oculto");
        });

        node.children.forEach((child) => renderTree(child, lista));
      }
    }
  }

  const response = await fetch("http://localhost:3000/api/entregas/7", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  });

  const datos = await response.json();
  const treeDirectory = datos.arbol_archivos;
  renderTree(treeDirectory, explorer);
}