import * as monaco from "monaco-editor";
import { run } from "../handlers.js";
import themeData from "monaco-themes/themes/Dracula.json";
import renderInicio from "./inicioView.js";

export default async function renderEditorView(prueba) {
  const usuario = document.getElementById("usuario");
  usuario.textContent = localStorage.getItem("usuario");

  const app = document.getElementById("app");
  const arbol = await obtenerTree();

  localStorage.setItem("prueba", JSON.stringify(prueba));

  app.innerHTML = `
  <nav id="headerEditor">
  <button id="btnEjecutar"><i class="fa-solid fa-play"></i></button>
  <button id="btnEnviar" class="btnBloqueado">Enviar</button></nav>
    <main>
      <section id="containerExplorer">
      <ul id="leftMenu">
      <li id="tabArchivos">Archivos</li>
      <li id="tabDescripcion">Descripción</li>
      </ul>
      <nav id="explorer"></nav>
      </section>
      <section id="codingArea">
        <nav id="topBar">
          <i class="fa-solid fa-code"></i>
          <div id="nota" style="display:none;"></div>
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
  const btnEnviar = document.getElementById("btnEnviar");
  const calificacion = document.getElementById("nota");

  if (prueba.estado === "Entregada") {
    btnEnviar.style.display = "none";
    const entrega = await obtenerEntrega(prueba.id_prueba);
    calificacion.textContent = `Calificación: ${entrega.calificacion}`;
    calificacion.style.display = "flex";
  }

  let actual;

  monaco.editor.defineTheme("github", themeData);
  monaco.editor.setTheme("github");

  const editor = monaco.editor.create(document.getElementById("editor"), {
    language: "javascript",
    theme: "github",
    fontFamily: "JetBrains Mono",
    readOnly: true
  });

  editor.setValue(`//Haz clic en un archivo para empezar a escribir`);

  //TODO: Botón ejecutar
  runCode.addEventListener("click", async () => {
    const language = obtenerLenguaje(actual.name)
    const result = await run(editor.getValue(), language);
    consola.classList = [];
    if (result.status_id === 3) {
      consola.classList.add("textoCorrecto");
      btnEnviar.classList.remove("btnBloqueado")
      btnEnviar.classList.add("btnActivo");

      btnEnviar.addEventListener("click", async () => {
        const response = await fetch(`http://localhost:3000/api/entregas/enviar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token")
          },
          body: JSON.stringify({
            arbol_archivos: arbol,
            id_prueba: prueba.id_prueba,
            id_curso: prueba.id_curso,
            codigo: actual,
            language: language
          })
        });
        const mensaje = await response.json();
        alert(mensaje.mensaje);
        await renderInicio();
      });

      return consola.textContent = result.stdout;
    } else if (result.status_id === 11 || result.status_id == 12) {
      btnEnviar.classList.add("btnBloqueado");
      consola.classList.add("textoError");
      consola.textContent = "Runtime Error: " + result.stderr;
    } else if (result.status_id === 6) {
      btnEnviar.classList.add("btnBloqueado");
      consola.classList.add("textoError");
      consola.textContent = "Compilation error: " + result.compile_output;
    }

  });

  editor.onDidChangeModelContent(() => {
    actual.content = editor.getValue();
  })


  //Cargar explorador de archivos
  cargarArchivos(arbol);

  //Generar arbol a partir de una entrega
  function renderTree(node, parent) {
    if (node.type === "file") {
      const a = document.createElement("li");
      a.innerHTML = `  <i class="fa-solid fa-file-code"></i> ${node.name}`;
      a.classList.add(node.type);
      a.addEventListener("click", () => {
        actual = node;
        console.log(actual.name);
        editor.updateOptions({ readOnly: false });
        btnEnviar.classList.add("btnBloqueado");
        editor.setValue(node.content);
      });

      a.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        menuFlotante.style.display = "flex";
        menuFlotante.style.left = e.clientX + "px";
        menuFlotante.style.top = e.clientY + "px";
        menuFlotante.classList.add("menuBurbuja");
        menuFlotante.innerHTML = "";
        const opt = document.createElement("li");
        opt.textContent = "Cambiar Nombre...";
        opt.addEventListener("click", () => {
          let nombre = prompt("Nuevo nombre:");
          actual.name = nombre;
          a.innerHTML = `  <i class="fa-solid fa-file-code"></i> ${nombre}`;
        });
        menuFlotante.appendChild(opt);
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
        const opt2 = document.createElement("li");
        opt2.textContent = "Nueva carpeta...";
        opt.addEventListener("click", () => {
          let nombre = prompt("Nombre del archivo:");
          node.children.push({
            name: nombre,
            type: "file",
            content: ""
          });
          cargarArchivos(arbol);
          console.log(node.children);
        });

        opt2.addEventListener("click", () => {
          let nombre = prompt("Nombre de la carpeta:");
          node.children.push({
            name: nombre,
            type: "folder",
            children: []
          });
          cargarArchivos(arbol);
        });
        opt.textContent = "Nuevo archivo..."
        menuFlotante.appendChild(opt);
        menuFlotante.appendChild(opt2);
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

  //TODO: Pestaña archivos
  tabArchivos.addEventListener("click", async () => {
    explorer.innerHTML = "";
    cargarArchivos(arbol);
  });

  //Pestaña descripcion
  tabDescripcion.addEventListener("click", async () => {
    console.log(prueba.id_prueba);
    const response = await fetch(`http://localhost:3000/api/pruebas/prueba/${prueba.id_prueba}`);
    const result = await response.json();
    explorer.innerHTML = "";
    explorer.textContent = result.descripcion;
  });

  //Carga el menu lateral agregando el boton nuevo
  function cargarArchivos(treeDirectory) {
    explorer.innerHTML = "";
    const nuevo = document.createElement("div");
    nuevo.id = "nuevo";
    const btnNuevo = document.createElement("button");
    btnNuevo.id = "btnNuevo"
    btnNuevo.innerHTML = `<i class="fa-solid fa-plus"></i> Nuevo`;

    //TODO: Hay acoplamiento con el obtenerTree
    btnNuevo.addEventListener("click", async () => {

      const treeDirectory = arbol;

      console.log(treeDirectory);
      let nombre = prompt("Nombre del archivo:");
      treeDirectory["children"].push({
        name: nombre,
        type: "file",
        content: ""
      });
      cargarArchivos(treeDirectory);
    });

    nuevo.appendChild(btnNuevo);
    explorer.prepend(nuevo);
    const archivos = document.createElement("div");
    explorer.appendChild(archivos);
    renderTree(treeDirectory, archivos);
  }

  async function obtenerTree() {
    if (prueba.estado === "Pendiente") {
      return {
        name: "Proyecto",
        type: "folder",
        children: []
      }
    } else {
      const datos = await obtenerEntrega(prueba.id_prueba)
      return datos.arbol_archivos;
    }
  }
}

async function obtenerEntrega(id_prueba) {
  const response = await fetch(`http://localhost:3000/api/entregas/${id_prueba}`, {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  });
  return await response.json();
}

function obtenerLenguaje(nombre) {
  const ext = nombre.split(".").pop();
  const mapa = {
    js: 63,
    py: 71,
    java: 91
  };
  return mapa[ext];
}