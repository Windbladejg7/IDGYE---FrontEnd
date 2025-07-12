export default async function renderInicio() {
    const app = document.getElementById("app");

    app.innerHTML = `
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
            </section>
        </div>
    </div>
  `;
    await cargarPruebas(await obtenerPruebas());
    document.getElementById("filtroEstado").addEventListener("change", async (e) => {
        const estado = e.target.value;
        let pruebas;
        if (estado !== "todas") {
            const response = await fetch(`http://localhost:3000/api/pruebas?estado=${estado}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            pruebas = await response.json();
        } else {
            pruebas = await obtenerPruebas();
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
                grupoPruebas = document.getElementById(classname + (cont-1));
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
            tituloYHora.innerHTML = `<span class="hora-prueba">${prueba.hora_max}</span> <p>${prueba.titulo}</p>`;

            infoPrueba.appendChild(tituloYHora);

            pruebaBox.appendChild(infoPrueba);

            const btn = document.createElement("button");

            if (prueba.estado === 'Pendiente') {
                btn.textContent = "Agregar entrega";
                pruebaBox.classList.add("pendiente");
            } else {
                btn.textContent = "Ver entrega";
                pruebaBox.classList.add("entregada");
            }

            btnBox.appendChild(btn);
            pruebaBox.appendChild(btnBox);
            grupoPruebas.appendChild(pruebaBox);
        }
    }
}

async function obtenerPruebas() {
    const response = await fetch("http://localhost:3000/api/pruebas", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token")
        }
    });

    if (response.ok) {
        return await response.json();
    }
}
