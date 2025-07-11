import * as monaco from "monaco-editor";
import { run } from "./handlers.js";

const explorer = document.getElementById("explorer");
const menuFlotante = document.getElementById("menuFlotante");
const runCode = document.getElementById("btnEjecutar");
const consola = document.getElementById("console");

const editor = monaco.editor.create(document.getElementById("editor"), {
  language: "javascript",
  theme: "vs-dark",
});

editor.setValue(`console.log("Hello, World!");`);
runCode.addEventListener("click", async()=>{
  const result = await run(editor.getValue());
  consola.textContent = result.stdout;
});

function renderTree(node, parent) {
  if (node.type === "file") {
    const a = document.createElement("li");
    a.textContent = node.name;
    a.classList.add(node.type);

    a.addEventListener("contextmenu", (e)=>contextMenuListener(e, "<li>Cambiar nombre...</li>"));

    parent.appendChild(a);
    a.addEventListener("click", () => {
      editor.setValue(node.content);
    });
  }

  const element = document.createElement("div");

  document.addEventListener("click", () => {
    menuFlotante.style.display = "none";
  });

  if (node.type === "folder") {
    const inner = document.createElement("div");
    inner.textContent = node.name;
    inner.classList.add(node.type);
    
    inner.addEventListener("contextmenu", (e) => contextMenuListener(e, "<li>Nuevo archivo...</li>"));
    element.appendChild(inner);
    parent.appendChild(element)

    if (node.children) {
      const lista = document.createElement("ul");
      element.appendChild(lista);

      inner.addEventListener("click", () => {
        lista.classList.toggle("oculto");
      });

      node.children.forEach((child) => {
        renderTree(child, lista);
      });
    }
  }
}

function contextMenuListener(e, html) {
  e.preventDefault();
  menuFlotante.innerHTML = html;
  menuFlotante.style.display = "flex";
  menuFlotante.style.left = e.clientX + "px";
  menuFlotante.style.top = e.clientY + "px";
}

async function obtenerTree(){
  const response = await fetch("http://localhost:3000/api/entregas/7/1");
  const datos = await response.json();
  const treeDirectory = datos[0].arbol_archivos;
  renderTree(treeDirectory, explorer);
}

obtenerTree();