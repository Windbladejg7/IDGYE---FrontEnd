import renderCursosView from "./cursosView";

export default function renderAdminLoginView() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section id="login">
      <h1>Panel docente</h1>
      <div id="formLogin">
        <input id="txtEmail" type="email" placeholder="Email" required />
        <input id="txtPassword" type="password" placeholder="Contraseña" required />
        <button id="btnEnviar" type="submit">Entrar</button>
      </div>
    </section>
  `;

  const email = document.getElementById("txtEmail");
  const password = document.getElementById("txtPassword");
  const btnEnviar = document.getElementById("btnEnviar");

  btnEnviar.addEventListener("click", async ()=>{
    const credenciales = {email:email.value, password:password.value};
    await login(credenciales);
  });

}

async function login(credenciales) {
  const response = await fetch("http://localhost:3000/api/admin/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body:JSON.stringify(credenciales)
  });

  if (response.ok) {
    const {token} = await response.json();
    localStorage.setItem("token", token);
    console.log(localStorage.getItem("token"));
    history.pushState(null, "", "/home");
    await renderCursosView();
  }
}
