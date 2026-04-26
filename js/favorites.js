export function obtenerFavoritos() {
    let datos = localStorage.getItem("zelda_favoritos");
    if (datos !== null) {
        return JSON.parse(datos);
    } else {
        return [];
    }
}

function guardarFavoritos(lista) {
    localStorage.setItem("zelda_favoritos", JSON.stringify(lista));
}


export function agregarFavorito(idApi, nombre, categoria) {
    let lista = obtenerFavoritos();

    let nuevoFav = {
        id_api: idApi,
        nombre: nombre,
        tipo: categoria,
        fecha: new Date().getTime()
    };

    console.log("Guardando nuevo favorito:", nuevoFav);

    lista.push(nuevoFav);
    guardarFavoritos(lista);
}

export function quitarFavorito(idApi) {
    let lista = obtenerFavoritos();
    let nuevaLista = [];

    for (let i = 0; i < lista.length; i++) {
        if (lista[i].id_api !== idApi) {
            nuevaLista.push(lista[i]);
        }
    }

    guardarFavoritos(nuevaLista);
}

export function vaciarFavoritos() {
    localStorage.removeItem("zelda_favoritos");
    console.log("Memoria de favoritos borrada.");
}