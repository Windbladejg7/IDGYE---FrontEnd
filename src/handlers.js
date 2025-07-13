export async function run(code, language) {
    console.log(language);
    const response = await fetch("http://localhost:3000/api/judge", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({code, language})
    });
    const salida = await response.json();
    return salida;
}