// Esta función busca en la API y devuelve los datos
export async function buscarZeldaAPI(categoria, palabra) {

    let nombreClave = "zelda_" + categoria + "_" + palabra;
    let datosGuardados = localStorage.getItem(nombreClave);


    if (datosGuardados !== null) {
        console.log("Recuperado de la caché local.");
        let datosConvertidos = JSON.parse(datosGuardados);
        return datosConvertidos;
    }


    console.log("Buscando en internet...");


    let urlOriginal = "https://zelda.fanapis.com/api/" + categoria + "?name=" + palabra;
    let urlProxy = "https://corsproxy.io/?" + encodeURIComponent(urlOriginal);

    let respuesta = await fetch(urlProxy);
    let json = await respuesta.json();
    let datos = json.data;


    localStorage.setItem(nombreClave, JSON.stringify(datos));

    return datos;
}