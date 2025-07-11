import * as monaco from "monaco-editor";
import { run } from "../handlers.js";

export default async function renderEditorView() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <main>
      <nav id="explorer"></nav>
      <section id="codingArea">
        <nav id="topBar">
          <button id="btnEjecutar">Run</button>
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

  const editor = monaco.editor.create(document.getElementById("editor"), {
    language: "javascript",
    theme: "vs-dark",
  });

  editor.setValue(`console.log("Hello, World!");`);

  runCode.addEventListener("click", async () => {
    const result = await run(editor.getValue());
    consola.textContent = result.stdout;
  });

  function renderTree(node, parent) {
    if (node.type === "file") {
      const a = document.createElement("li");
      a.textContent = node.name;
      a.classList.add(node.type);
      a.addEventListener("click", () => {
        editor.setValue(node.content);
      });
      parent.appendChild(a);
    }

    const element = document.createElement("div");

    if (node.type === "folder") {
      const inner = document.createElement("div");
      inner.textContent = node.name;
      inner.classList.add(node.type);
      element.appendChild(inner);
      parent.appendChild(element);

      if (node.children) {
        const lista = document.createElement("ul");
        element.appendChild(lista);

        inner.addEventListener("click", () => {
          lista.classList.toggle("oculto");
        });

        node.children.forEach((child) => renderTree(child, lista));
      }
    }
  }

  const response = await fetch("http://localhost:3000/api/entregas/7", {
    headers:{
      "Authorization":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imx1aXNhQGdtYWlsLmNvbSIsImlkIjo3LCJpYXQiOjE3NTIyMDY1Mjh9.3qEwtCVrE9DkuPJbWgpEekDw91oAaPfMNxcPWT-E8Xk"
    }
  });
  const datos = await response.json();
  const treeDirectory = datos.arbol_archivos;
  renderTree(treeDirectory, explorer);
}