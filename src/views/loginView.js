import renderInicio from "./inicioView";

export default function renderLoginView() {
  const usuario = document.getElementById("usuario");
  usuario.textContent = "";

  const app = document.getElementById("app");
  app.innerHTML = `
    <section id="login">
      <h1>Iniciar sesión</h1>
      <div id="formLogin">
        <input id="txtEmail" type="email" placeholder="Email" required />
        <input id="txtPassword" type="password" placeholder="Contraseña" required />
        <button id="btnEnviar" type="submit">Entrar</button>
        <p id="mensajeError" style="color:red; font-size: 0.9rem; margin-top: 8px;"></p>
      </div>
    </section>
  `;

  const email = document.getElementById("txtEmail");
  const password = document.getElementById("txtPassword");
  const btnEnviar = document.getElementById("btnEnviar");
  const mensajeError = document.getElementById("mensajeError");

  document.getElementById("tabs").style.display = "none";

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
    const response = await fetch("https://idgye.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credenciales)
    });

    if (!response.ok) {
      if (response.status === 401) {
        mensajeError.textContent = "Credenciales incorrectas. Inténtalo de nuevo.";
      } else {
        mensajeError.textContent = "Ocurrió un error. Intenta más tarde.";
      }
      return;
    }

    const { token } = await response.json();
    localStorage.setItem("token", token);

    const datosUsuarioResponse = await fetch(`https://idgye.onrender.com/api/estudiantes/${credenciales.email}`);
    const datosUsuario = await datosUsuarioResponse.json();
    localStorage.setItem("usuario", datosUsuario.nombre);

    document.getElementById("tabs").style.display = "flex";
    document.getElementById("tabs").href = "/home";
    history.pushState(null, "", "/home");

    await renderInicio();

  } catch (error) {
    console.error(error);
    mensajeError.textContent = "Error de conexión con el servidor.";
  }
}



