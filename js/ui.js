import { buscarZeldaAPI } from './api.js';
import { obtenerFavoritos, agregarFavorito, quitarFavorito, vaciarFavoritos } from './favorites.js';
import { leerArchivoXML, convertirACSV } from './transform.js';

let temporizador;

// REFERENCIAS HTML
const inputBuscador = document.getElementById("input-buscador");
const selectTipo = document.getElementById("tipo-busqueda");
const cajaResultados = document.getElementById("resultados-busqueda");
const mensajeBuscador = document.getElementById("mensaje-buscador");

const cajaFavoritos = document.getElementById("resultados-favoritos");
const selectFiltro = document.getElementById("filtrar-favoritos");
const selectOrden = document.getElementById("ordenar-favoritos");
const btnVaciar = document.getElementById("btn-vaciar-favoritos");

const btnCargarXML = document.getElementById("btn-cargar-xml");
const btnExportarCSV = document.getElementById("btn-exportar-csv");
const cajaXML = document.getElementById("resultados-xml");

// INICIO Y EVENTOS
mostrarFavoritosUI();

inputBuscador.addEventListener("input", alEscribir);
selectTipo.addEventListener("change", ejecutarBusqueda);

selectFiltro.addEventListener("change", mostrarFavoritosUI);
selectOrden.addEventListener("change", mostrarFavoritosUI);

btnVaciar.addEventListener("click", function() {
    vaciarFavoritos();
    mostrarFavoritosUI();
    ejecutarBusqueda();
});

btnCargarXML.addEventListener("click", cargarYMostrarXML);
btnExportarCSV.addEventListener("click", descargarArchivoCSV);

// ==========================================
// BUSCADOR
// ==========================================

function alEscribir() {
    clearTimeout(temporizador);
    temporizador = setTimeout(ejecutarBusqueda, 500);
}

async function ejecutarBusqueda() {
    let palabra = inputBuscador.value.trim();
    let categoria = selectTipo.value; // "characters" o "games"

    if (palabra === "") {
        cajaResultados.innerHTML = "";
        mensajeBuscador.textContent = "";
        return;
    }

    mensajeBuscador.textContent = "Buscando en Hyrule...";
    mensajeBuscador.style.color = "var(--color-parchment-white)";
    cajaResultados.innerHTML = "";

    try {
        let resultados = await buscarZeldaAPI(categoria, palabra);

        if (resultados.length === 0) {
            mensajeBuscador.textContent = "No se encontró nada.";
            return;
        }

        mensajeBuscador.textContent = "";

        dibujarTarjetasBuscador(resultados, categoria);

    } catch (error) {
        mensajeBuscador.textContent = "Error al conectar con la API.";
        mensajeBuscador.style.color = "red";
    }
}

function dibujarTarjetasBuscador(lista, categoria) {
    cajaResultados.innerHTML = "";
    let misFavs = obtenerFavoritos();

    for (let i = 0; i < lista.length; i++) {
        let item = lista[i];
        let tarjeta = document.createElement("article");
        tarjeta.className = "card";

        let esFavorito = false;
        for (let j = 0; j < misFavs.length; j++) {
            if (misFavs[j].id_api === item.id) {
                esFavorito = true;
            }
        }

        let descripcion = item.description || "Sin descripción disponible.";
        if (descripcion.length > 80) descripcion = descripcion.substring(0, 80) + "...";

        let claseBoton = esFavorito ? "btn btn--danger" : "btn";
        let textoBoton = esFavorito ? "Quitar Favorito" : "Añadir a Favoritos";

        tarjeta.innerHTML = `
            <h3 class="card__title">${item.name}</h3>
            <p class="card__desc">${descripcion}</p>
            <button type="button" class="${claseBoton}">${textoBoton}</button>
        `;

        let boton = tarjeta.querySelector("button");
        boton.addEventListener("click", function() {
            if (esFavorito) {
                quitarFavorito(item.id);
            } else {
                agregarFavorito(item.id, item.name, categoria);
            }
            ejecutarBusqueda();
            mostrarFavoritosUI();
        });

        cajaResultados.appendChild(tarjeta);
    }
}

// ==========================================
// FAVORITOS (Filtros y Orden)
// ==========================================

function mostrarFavoritosUI() {
    cajaFavoritos.innerHTML = "";
    let listaFavs = obtenerFavoritos();

    let filtro = selectFiltro.value;
    let listaFiltrada = [];

    // 1. FILTRAR
    for (let i = 0; i < listaFavs.length; i++) {
        let fav = listaFavs[i];


        if (filtro === "todos" || fav.tipo === filtro) {
            listaFiltrada.push(fav);
        }
    }


    let orden = selectOrden.value;
    if (orden === "az") {
        listaFiltrada.sort(function(a, b) {
            let nombreA = a.nombre.toLowerCase();
            let nombreB = b.nombre.toLowerCase();
            if (nombreA < nombreB) return -1;
            if (nombreA > nombreB) return 1;
            return 0;
        });
    } else if (orden === "recientes") {
        listaFiltrada.sort(function(a, b) {
            return b.fecha - a.fecha;
        });
    }

    if (listaFiltrada.length === 0) {
        cajaFavoritos.innerHTML = "<p style='color: var(--color-parchment-white);'>No tienes favoritos aquí.</p>";
        return;
    }

    for (let i = 0; i < listaFiltrada.length; i++) {
        let fav = listaFiltrada[i];
        let tarjeta = document.createElement("article");
        tarjeta.className = "card";

        let tipoVisual = (fav.tipo === "games") ? "Juego" : "Personaje";

        tarjeta.innerHTML = `
            <h3 class="card__title">${fav.nombre}</h3>
            <p class="card__desc">Categoría: ${tipoVisual}</p>
            <button type="button" class="btn btn--danger">Eliminar</button>
        `;

        let botonEliminar = tarjeta.querySelector("button");
        botonEliminar.addEventListener("click", function() {
            quitarFavorito(fav.id_api);
            mostrarFavoritosUI();
            ejecutarBusqueda();
        });

        cajaFavoritos.appendChild(tarjeta);
    }
}

// ==========================================
// FUNCIONES DE XML Y CSV
// ==========================================

let datosXMLGuardados = [];

async function cargarYMostrarXML() {
    btnCargarXML.textContent = "Cargando...";
    cajaXML.innerHTML = "";

    try {
        datosXMLGuardados = await leerArchivoXML();

        for (let i = 0; i < datosXMLGuardados.length; i++) {
            let juego = datosXMLGuardados[i];

            let tarjeta = document.createElement("article");
            tarjeta.className = "card";

            tarjeta.innerHTML = `
                <h3 class="card__title">${juego.titulo}</h3>
                <p class="card__desc" style="text-align: left;">
                    <strong>Consola:</strong> ${juego.plataforma}<br>
                    <strong>Año:</strong> ${juego.anio}<br>
                    <strong>Puntos:</strong> ${juego.puntuacion}
                </p>
            `;
            cajaXML.appendChild(tarjeta);
        }

        btnExportarCSV.disabled = false;

    } catch (error) {
        cajaXML.innerHTML = "<p style='color:var(--color-heart-red);'>Error al cargar el XML. ¿Creaste la carpeta data y el archivo juegos.xml?</p>";
        console.error(error);
    }

    btnCargarXML.textContent = "Cargar XML";
}

function descargarArchivoCSV() {

    if (datosXMLGuardados.length === 0) return;

    let textoCSV = convertirACSV(datosXMLGuardados);

    let archivoBlob = new Blob([textoCSV], { type: "text/csv;charset=utf-8;" });
    let enlaceFalso = document.createElement("a");
    enlaceFalso.href = URL.createObjectURL(archivoBlob);
    enlaceFalso.download = "zelda_catalogo.csv";

    enlaceFalso.click();
}