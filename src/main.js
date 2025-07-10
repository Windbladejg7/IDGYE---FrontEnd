import * as monaco from "monaco-editor";
import { run } from "./handlers.js";

const explorer = document.getElementById("explorer");
const menuFlotante = document.getElementById("menuFlotante");
const runCode = document.getElementById("btnEjecutar");
const console = document.getElementById("console");

const editor = monaco.editor.create(document.getElementById("editor"), {
  language: "javascript",
  theme: "vs-dark",
});

editor.setValue(`console.log("Hello, World!");`);
runCode.addEventListener("click", async()=>{
  const result = await run(editor.getValue());
  console.textContent = result.stdout;
});

const treeDirectory = {
  name: "root",
  type: "folder",
  children: [
    {
      name: "emptyfile.js",
      type: "file",
      content: "console.log('Hola Mundo')"
    },

    {
      name: "other.js",
      type: "file",
      content: "let value = 1"
    },

    {
      name: "proyecto1",
      type: "folder",
      children: [
        {
          name: "archivo.py",
          type: "file",
          content: "print('Hello')"
        }
      ]
    }
  ]
}

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

renderTree(treeDirectory, explorer);