export default async function renderPruebasView(curso) {
    const app = document.getElementById("app");
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
            <form id="formAgregarPrueba">
                <label>Título</label>
                <input type="text" name="titulo" required>

                <label>Descripción</label>
                <textarea name="descripcion" rows="3"></textarea>

                <label>Fecha máxima</label>
                <input type="date" name="fecha_max" required>

                <label>Hora máxima</label>
                <input type="time" name="hora_max" required>

                <label>Código de prueba</label>
                <textarea name="codigo_base" rows="6" placeholder="Pegué aquí el código que se usará para probar los ejercicios "></textarea>

                <button type="submit">Guardar</button>
            </form>
        </div>
    </div>
  `;

    const pruebas = await cargarPruebas(curso.id_curso);
    const pruebasContainer = document.getElementById("pruebasAsignadasContainer");
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
