import Chart from 'chart.js/auto';
import renderAdminLoginView from './adminLoginView';

export default async function renderEntregasView(prueba, id_curso) {
    const usuario = document.getElementById("usuario");
    usuario.textContent = localStorage.getItem("usuario");
    document.getElementById("homeTab").href = "/cursos";
    usuario.style.cursor = "pointer";
    usuario.addEventListener("click", () => {
        history.pushState(null, "", "/admin");
        renderAdminLoginView();
    });

    const app = document.getElementById("app");

    localStorage.setItem("prueba", JSON.stringify(prueba));
    localStorage.setItem("id_curso", id_curso);

    app.innerHTML = `
    <div id="info">
        <section id="seccionPrueba">
            <h2 id="titulo"></h2>
            <p id="fApertura"><b>Fecha apertura: </b></p>
            <p id="fCierre"><b>Fecha cierre: </b></p>
            <div id="descripcion"></div>
        </section>
        <div id="graficoContainer">
            <canvas id="grafico"></canvas>
        </div>
    </div>
    <div id="entregasContainer">
        <table>
            <thead><th>Fecha de entrega</th><th>Hora</th><th>Estudiante</th><th>Calificación</th></thead>
            <tbody id="table">
            </tbody>
        </table>
    </div>
    `;
    const grafico = document.getElementById("grafico");
    const entregasContainer = document.getElementById("entregasContainer");

    const numEntregas = await consultarNumEntregas(prueba.id_prueba, id_curso);
    const numEstudiantes = await consultarNumEstudiantes(id_curso);
    const numPendientes = numEstudiantes - numEntregas;

    new Chart(grafico, {
        type: "doughnut",
        data: {
            labels: ["Pendientes", "Entregados"],
            datasets: [{
                data: [numPendientes, numEntregas],
                backgroundColor: ['rgb(255, 99, 132)',
                    'rgb(54, 162, 235)'],
                hoverOffset: 25
            }]
        },
        options: {
            layout: {
                padding: 20
            }
        }
    });

    const tabla = document.getElementById("table");
    document.getElementById("titulo").textContent = prueba.titulo;

    const fechaInicio = new Date(prueba.fecha_creacion);
    const horaInicio = prueba.hora_inicio.slice(0, 5);

    const fechaCierre = new Date(prueba.fecha_max);
    const horaCierre = prueba.hora_max.slice(0, 5);

    document.getElementById("fApertura").innerHTML += formatearFechaYHora(fechaInicio, horaInicio);
    document.getElementById("fCierre").innerHTML += formatearFechaYHora(fechaCierre, horaCierre);
    document.getElementById("descripcion").innerHTML += prueba.descripcion;

    const entregas = await obtenerEntregas(prueba.id_prueba, id_curso);

    if (entregas.length > 0) {
        for (let entrega of entregas) {
            const fila = document.createElement("tr");

            const fEntrega = document.createElement("td");

            fEntrega.textContent = formatearFecha(entrega.fecha_entrega);
            fila.appendChild(fEntrega);

            const hEntrega = document.createElement("td");
            hEntrega.textContent = entrega.hora_entrega;
            fila.appendChild(hEntrega);

            const estudiante = document.createElement("td");
            estudiante.textContent = entrega.nombre;
            fila.appendChild(estudiante);

            const calificacion = document.createElement("td");
            calificacion.textContent = entrega.calificacion;
            fila.appendChild(calificacion);
            tabla.appendChild(fila);
        }
    } else {
        const fila = document.createElement("tr");
        const mensaje = document.createElement("td");
        mensaje.textContent = "No se han realizado entregas todavía"
        mensaje.colSpan = 4;
        fila.appendChild(mensaje);
        tabla.appendChild(fila);
    }
}

async function consultarNumEntregas(id_prueba, id_curso) {
    const response = await fetch(`http://localhost:3000/api/totales/entregas/${id_prueba}/${id_curso}`);
    const obj = await response.json();
    return obj.total_entregas;
}

async function consultarNumEstudiantes(id_curso) {
    const response = await fetch(`http://localhost:3000/api/totales/estudiantes/${id_curso}`);
    const obj = await response.json();
    return obj.total_estudiantes;
}

function formatearFecha(fecha) {
    const fechaEntrega = new Date(fecha)
    const fechaFormateada = new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(fechaEntrega);
    return fechaFormateada;
}

function formatearFechaYHora(fecha, hora) {
    const fechaFormateada = new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(fecha);
    return fechaFormateada + ", " + hora;
}

async function obtenerEntregas(id_prueba, id_curso) {
    const response = await fetch(`http://localhost:3000/api/entregas/${id_prueba}/${id_curso}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });
    return await response.json();
}