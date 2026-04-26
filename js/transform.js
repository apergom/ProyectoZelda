export async function leerArchivoXML() {

    let respuesta = await fetch("./data/juegos.xml");
    let textoXML = await respuesta.text();

    let parser = new DOMParser();
    let documentoXML = parser.parseFromString(textoXML, "text/xml");

    let etiquetasJuego = documentoXML.getElementsByTagName("juego");
    let listaJuegos = [];

    for (let i = 0; i < etiquetasJuego.length; i++) {
        let nodo = etiquetasJuego[i];

        let objeto = {
            id: nodo.getAttribute("id"),
            titulo: nodo.querySelector("titulo").textContent,
            desarrolladora: nodo.querySelector("desarrolladora").textContent,
            publicadora: nodo.querySelector("publicadora").textContent,
            plataforma: nodo.querySelector("plataforma").textContent,
            // Convertimos año y puntuación a Números, como pide el encargo
            anio: Number(nodo.querySelector("anio").textContent),
            puntuacion: Number(nodo.querySelector("puntuacion").textContent)
        };

        listaJuegos.push(objeto); // Lo metemos en nuestra lista
    }

    return listaJuegos;
}

export function convertirACSV(listaDatos) {
    let texto = "ID,Titulo,Desarrolladora,Publicadora,Plataforma,Año,Puntuacion\n";
    for (let i = 0; i < listaDatos.length; i++) {
        let j = listaDatos[i];
        texto += j.id + "," + j.titulo + "," + j.desarrolladora + "," + j.publicadora + "," + j.plataforma + "," + j.anio + "," + j.puntuacion + "\n";
    }

    return texto;
}