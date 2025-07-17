import renderEditorView from "./editorView";
import renderLoginView from "./loginView";

function devolverHTML() {
    return `
    <nav id="pruebasHeader">
        <h1>Pruebas</h1>
    </nav>
    <div id="outer">
        <div id="inner">
            <section id="pruebasContainer"></section>
            <section id="filtroEstado">
                <label><input type="radio" name="estado" value="todas" checked> Todas</label><br>
                <label><input type="radio" name="estado" value="Pendiente"> Pendientes</label><br>
                <label><input type="radio" name="estado" value="Entregada"> Entregadas</label><br>
                <label><input type="radio" name="estado" value="Atrasada"> Atrasadas</label><br>
            </section>
        </div>
    </div>
  `;
}

export default async function renderInicio() {
    const usuario = document.getElementById("usuario");
    usuario.textContent = localStorage.getItem("usuario");
    usuario.style.cursor = "pointer";
    usuario.addEventListener("click", ()=>{
        history.pushState(null, "", "/");
        renderLoginView();
    });

    document.getElementById("homeTab").href = "/home";

    const app = document.getElementById("app");
    app.innerHTML = devolverHTML();
    await cargarPruebas(await obtenerPruebas());

    //Filtrar pruebas
    document.getElementById("filtroEstado").addEventListener("change", async (e) => {
        const estado = e.target.value;
        let pruebas;
        if (estado === "todas") {
            pruebas = await obtenerPruebas();
        } else if (estado !== "Atrasada") {
            const response = await fetch(`https://idgye.onrender.com/api/pruebas?estado=${estado}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            pruebas = await response.json();
        } else {
            const response = await fetch(`https://idgye.onrender.com/api/pruebas?atrasadas=true`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            pruebas = await response.json();
        }
        cargarPruebas(pruebas);
    });
}

async function cargarPruebas(pruebas) {
    const pruebasContainer = document.getElementById("pruebasContainer");
    pruebasContainer.innerHTML = "";
    if (pruebas.length > 0) {
        let dia;
        let cont = 1;
        const classname = "grupoPrueba";

        for (let prueba of pruebas) {
            let grupoPruebas;
            const fecha = new Date(`${prueba.fecha}`);

            const diaSemana = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(fecha);
            const fechaFormateada = new Intl.DateTimeFormat("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }).format(fecha);

            if (diaSemana !== dia) {
                grupoPruebas = document.createElement("div");
                grupoPruebas.id = classname + cont;
                grupoPruebas.classList.add("grupoPrueba");

                const fechaHeader = document.createElement("h2");
                fechaHeader.textContent = `${diaSemana}, ${fechaFormateada}`;
                grupoPruebas.appendChild(fechaHeader);

                pruebasContainer.appendChild(grupoPruebas);
            } else {
                grupoPruebas = document.getElementById(classname + (cont - 1));
            }

            dia = diaSemana;
            cont++;

            const pruebaBox = document.createElement("div");
            pruebaBox.classList.add("prueba-box");

            const infoPrueba = document.createElement("div");
            infoPrueba.classList.add("info-prueba");

            const btnBox = document.createElement("div");
            btnBox.classList.add("botones-prueba");

            const tituloYHora = document.createElement("p");
            tituloYHora.innerHTML = `<span class="hora-prueba">${prueba.hora_max}</span><p>${prueba.titulo}</p>`;

            infoPrueba.appendChild(tituloYHora);

            pruebaBox.appendChild(infoPrueba);

            const btn = document.createElement("button");

            if (prueba.estado === 'Pendiente') {
                btn.textContent = "Agregar entrega";
                pruebaBox.classList.add("pendiente");
                btn.addEventListener("click", async () => {
                    history.pushState(null, "", "/editor");
                    await renderEditorView(prueba);
                });
            } else if (prueba.estado === 'Entregada') {
                btn.textContent = "Ver entrega";
                pruebaBox.classList.add("entregada");
                btn.addEventListener("click", async () => {
                    history.pushState(null, "", "/editor");
                    await renderEditorView(prueba);
                });
            } else {
                btn.textContent = "Atrasada"
                btn.classList.add("atrasada");
                btn.addEventListener("click", () => alert("Ha expirado la fecha para subir esta prueba"));
            }


            btnBox.appendChild(btn);
            pruebaBox.appendChild(btnBox);
            grupoPruebas.appendChild(pruebaBox);
        }
    } else {
        pruebasContainer.textContent = "Sin pruebas";
    }
}

async function obtenerPruebas() {
    const response = await fetch("https://idgye.onrender.com/api/pruebas", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token")
        }
    });

    if (response.ok) {
        return await response.json();
    }
}
