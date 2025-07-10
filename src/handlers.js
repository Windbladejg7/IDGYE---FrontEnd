export async function run(code) {
    const response = await fetch("http://localhost:3000/api/judge", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
    });
    const salida = await response.json();
    return salida;
}