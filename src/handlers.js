export async function run(code, language) {
    console.log(language);
    const response = await fetch("https://idgye.onrender.com/api/judge", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({code, language})
    });
    const salida = await response.json();
    return salida;
}