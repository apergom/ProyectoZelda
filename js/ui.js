// Importamos la función de nuestro archivo api.js
import { buscarZeldaAPI } from './api.js';

// ==========================================
// VARIABLES GLOBALES
// ==========================================
let temporizador;

// ==========================================
// REFERENCIAS AL HTML
// ==========================================
const inputBuscador = document.getElementById("input-buscador");
const selectTipo = document.getElementById("tipo-busqueda");
const cajaResultados = document.getElementById("resultados-busqueda");
const mensajeBuscador = document.getElementById("mensaje-buscador");

// ==========================================
// INICIO Y EVENTOS
// ==========================================

inputBuscador.addEventListener("input", alEscribir);


selectTipo.addEventListener("change", ejecutarBusqueda);

// ==========================================
// FUNCIONES DEL BUSCADOR
// ==========================================


function alEscribir() {
    clearTimeout(temporizador); // Borramos la cuenta atrás anterior
    temporizador = setTimeout(ejecutarBusqueda, 500);
}

// Función principal que controla el proceso
async function ejecutarBusqueda() {
    let palabra = inputBuscador.value.trim();
    let categoria = selectTipo.value;


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
            mensajeBuscador.textContent = "No se encontró nada con ese nombre.";
            return;
        }

        mensajeBuscador.textContent = "";
        dibujarTarjetasBuscador(resultados);

    } catch (error) {

        mensajeBuscador.textContent = "Error al conectar con la API.";
        mensajeBuscador.style.color = "red";
        console.error(error);
    }
}

// Esta función se encarga de crear el HTML de cada resultado
function dibujarTarjetasBuscador(lista) {
    cajaResultados.innerHTML = "";


    for (let i = 0; i < lista.length; i++) {
        let item = lista[i];


        let tarjeta = document.createElement("article");
        tarjeta.className = "card";


        let descripcion = item.description;
        if (!descripcion) {
            descripcion = "Sin descripción disponible.";
        } else if (descripcion.length > 80) {
            descripcion = descripcion.substring(0, 80) + "...";
        }


        tarjeta.innerHTML = `
            <h3 class="card__title">${item.name}</h3>
            <p class="card__desc">${descripcion}</p>
            <button class="btn" disabled>Añadir a Favoritos</button>
        `;


        cajaResultados.appendChild(tarjeta);
    }
}