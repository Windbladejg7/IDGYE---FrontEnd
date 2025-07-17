import renderCursosView from "./cursosView";

export default function renderAdminLoginView() {
  const app = document.getElementById("app");
  document.getElementById("tabs").style.display = "none";

  app.innerHTML = `
    <section id="login">
      <h1>Panel docente</h1>
      <div id="formLogin">
        <input id="txtEmail" type="email" placeholder="Email" required />
        <input id="txtPassword" type="password" placeholder="Contraseña" required />
        <button id="btnEnviar" type="submit">Entrar</button>
        <p id="mensajeError" style="color: red; font-size: 0.9rem; margin-top: 8px;"></p>
      </div>
    </section>
  `;

  const email = document.getElementById("txtEmail");
  const password = document.getElementById("txtPassword");
  const btnEnviar = document.getElementById("btnEnviar");
  const mensajeError = document.getElementById("mensajeError");

  btnEnviar.addEventListener("click", async () => {
    mensajeError.textContent = ""; // limpiar mensaje anterior

    if (!email.value || !password.value) {
      mensajeError.textContent = "Por favor, completa todos los campos.";
      return;
    }

    const credenciales = { email: email.value, password: password.value };
    await login(credenciales, mensajeError);
  });
}

async function login(credenciales, mensajeError) {
  try {
    const response = await fetch("https://idgye.onrender.com/api/admin/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credenciales)
    });

    if (!response.ok) {
      if (response.status === 401) {
        mensajeError.textContent = "Credenciales incorrectas. Inténtalo nuevamente.";
      } else {
        mensajeError.textContent = "Error al iniciar sesión. Intenta más tarde.";
      }
      return;
    }

    const { token } = await response.json();
    localStorage.setItem("token", token);

    const datosDocenteResponse = await fetch(`https://idgye.onrender.com/api/docentes/${credenciales.email}`);
    const datosDocente = await datosDocenteResponse.json();
    localStorage.setItem("usuario", datosDocente.nombre);

    document.getElementById("tabs").style.display = "flex";
    document.getElementById("homeTab").href = "/cursos";
    history.pushState(null, "", "/cursos");

    await renderCursosView();

  } catch (error) {
    console.error(error);
    mensajeError.textContent = "No se pudo conectar con el servidor.";
  }
}
