import renderEntregasView from "./entregasView";
import renderAdminLoginView from "./adminLoginView";

export default async function renderPruebasView(curso) {
    const usuario = document.getElementById("usuario");
    usuario.textContent = localStorage.getItem("usuario");
    document.getElementById("homeTab").href = "/cursos";
    usuario.style.cursor = "pointer";
    usuario.addEventListener("click", () => {
        history.pushState(null, "", "/admin");
        renderAdminLoginView();
    });


    const app = document.getElementById("app");

    localStorage.setItem("curso", JSON.stringify(curso));

    app.innerHTML = `
    <nav id="pruebasHeader">
      <h1>${curso.nombre}</h1>
    </nav>
    <nav id="menuAgregar">
      <button id="btnAgregarPrueba">Agregar Prueba</button>
    </nav>
    <div id="mainPruebasCurso">
      <div id="pruebasAsignadasContainer"></div>
    </div>

    <div id="modalAgregarPrueba" class="modal">
        <div class="modal-content">
            <span id="cerrarModal" class="close">x</span>
            <h2>Agregar Prueba</h2>
            <div id="formAgregarPrueba">
                <label>Título</label>
                <input type="text" name="titulo" required id="titulo">

                <label>Descripción</label>
                <textarea name="descripcion" rows="3" id="descripcion"></textarea>

                <label>Fecha máxima</label>
                <input type="date" name="fecha_max" id="fecha_max" required>

                <label>Hora máxima</label>
                <input type="time" name="hora_max" id="hora_max" required>

                <label>Código de prueba</label>
                <textarea name="pruebas" id="pruebas" rows="6" placeholder="Pegué aquí el código que se usará para probar los ejercicios "></textarea>

                <button type="submit" id="btnEnviar">Guardar</button>
            </div>
        </div>
    </div>
  `;

    const pruebas = await cargarPruebas(curso.id_curso);
    const pruebasContainer = document.getElementById("pruebasAsignadasContainer");
    const btnEnviar = document.getElementById("btnEnviar");

    btnEnviar.addEventListener("click", async () => formularioHandler(curso));

    pruebasContainer.innerHTML = "";

    const btnAgregar = document.getElementById("btnAgregarPrueba");
    btnAgregar.addEventListener("click", () => {
        document.querySelector("#menuAgregar button").addEventListener("click", () => {
            document.getElementById("modalAgregarPrueba").style.display = "flex";
        });
        document.getElementById("cerrarModal").addEventListener("click", () => {
            document.getElementById("modalAgregarPrueba").style.display = "none";
        });
    });

    if (pruebas.length > 0) {
        let dia;
        let cont = 1;
        const classname = "grupoPrueba";

        for (let prueba of pruebas) {
            let grupoPruebas;
            const fecha = new Date(prueba.fecha_max);
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

            pruebaBox.addEventListener("click", async () => {
                history.pushState(null, "", "/entregas");
                await renderEntregasView(prueba, curso.id_curso)
            });

            const infoPrueba = document.createElement("div");
            infoPrueba.classList.add("info-prueba");

            const btnBox = document.createElement("div");
            btnBox.classList.add("botones-prueba");

            const horaSinSegundos = prueba.hora_max.slice(0, 5);

            const horaSpan = document.createElement("span");
            horaSpan.classList.add("hora-prueba");
            horaSpan.textContent = horaSinSegundos;

            const tituloP = document.createElement("p");
            tituloP.textContent = prueba.titulo;

            infoPrueba.appendChild(horaSpan);
            infoPrueba.appendChild(tituloP);

            pruebaBox.appendChild(infoPrueba);

            // Si quieres agregar botones más adelante:
            // const btn = document.createElement("button");
            // btn.textContent = "Ver Detalles";
            // btnBox.appendChild(btn);
            // pruebaBox.appendChild(btnBox);

            grupoPruebas.appendChild(pruebaBox);
        }
    } else {
        pruebasContainer.textContent = "No hay pruebas para este curso";
    }
}

async function cargarPruebas(id_curso) {
    const response = await fetch(`http://localhost:3000/api/pruebas/${id_curso}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });
    return await response.json();
}

async function formularioHandler(curso) {

    const datos = {
        titulo: document.getElementById("titulo").value,
        descripcion: document.getElementById("descripcion").value,
        fecha_max: document.getElementById("fecha_max").value,
        hora_max: document.getElementById("hora_max").value + ":00",
        curso: curso.id_curso,
        codigo_pruebas: { pruebas: document.getElementById("pruebas").value }
    };

    const res = await fetch("http://localhost:3000/api/pruebas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token")
        },
        body: JSON.stringify(datos)
    });

    const json = await res.json();
    if (res.ok) {
        alert("Prueba agregada correctamente");
        document.getElementById("modalAgregarPrueba").style.display = "none";
        renderPruebasView(curso);
    } else {
        alert(json.error || "Ocurrió un error");
    }

}
