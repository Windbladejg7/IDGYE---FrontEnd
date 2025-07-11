export default function renderLoginView() {
  return `
    <section id="login">
      <h1>Iniciar sesión</h1>
      <form id="formLogin">
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>
    </section>
  `;
}
