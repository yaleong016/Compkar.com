import {calculer} from "./calc.js";
import {calculerLeo} from "./calc.js";
import {etient} from "./écran.js";
import {allumer} from "./écran.js";
import {totale} from "./calc.js";
import {lineGraph} from "./graph.js";
import {lineLeo} from "./graph.js";
import {calcHertz} from "./calc.js";
import {creerHeat} from "./heatMap.js";
import {creerLegend} from "./heatMap.js";

const abonnementCheckbox = document.getElementById("abonnement");
const aller = document.getElementById("aller");
const carSizeRadios = document.querySelectorAll('input[name="car-size"]');
const text = document.querySelector("#text");
const enter = document.querySelector("#button1");
const reset = document.querySelector("#button2");
const range = document.getElementById("rang");
const rtext = document.getElementById("rangeValue");
const bKilo = document.getElementById("kilo");
const bHeure = document.getElementById("heure");

rtext.textContent = range.value + '%';
range.addEventListener('input', function() {
    rtext.textContent = range.value + '%';
});



//Pour la carte
var map = L.map('map').setView([45.717626, 5.088043], 13);
function createMap () {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    var popup = L.popup()
        .setLatLng([45.717626, 5.088043])
        .setContent("Aéroport Lyon Saint-Exupéry")
        .openOn(map);
}
let times = 0;
let pos = [];
var marker1;
var marker2;
var chemin;
var km;
var temps;


function onMapClick(e) {
    bKilo.disabled = true;
    bHeure.disabled = true;
    if (times < 2) {
        pos.push(e.latlng);
        console.log("You clicked the map at " + e.latlng);
        if (times === 0) {
            marker1 = L.marker(e.latlng).addTo(map);
            marker1.bindPopup("<b>Début</b>").openPopup();
        }
        else if (times === 1) {
            marker2 = L.marker(e.latlng).addTo(map);
            marker2.bindPopup("<b>Fin</b>").openPopup();
            route();
        }
        times++;
    }
    else {
        times = 0;
        pos = [];
        map.removeLayer(marker1);
        map.removeLayer(marker2);
        clearRoute();
    }
}
export {onMapClick};

createMap();
creerLegend();
map.on('click', onMapClick);
enter.onclick = creer;
reset.onclick = all;
function all () { //petite fonction pour allumer
    bKilo.disabled = false;
    bHeure.disabled = false;
    bKilo.value = "";
    bHeure.value = "";
    allumer(abonnementCheckbox, aller, range, rtext, times, pos, marker1, marker2, map, carSizeRadios, text);
}

function route () {
    chemin = L.Routing.control({
        waypoints: [
            L.latLng(marker1.getLatLng()),
            L.latLng(marker2.getLatLng())
        ]
    }).on('routesfound', function(e) {
        console.log(e);
        km = e.routes[0]['summary']['totalDistance'] / 1000;
        temps = e.routes[0]['summary']['totalTime'] / 3600;
    }).addTo(map);
}
function clearRoute() {
    if (chemin) {
        chemin.setWaypoints([]); // Clear the waypoints
        map.removeControl(chemin); // Remove the routing control from the map
        chemin = null; // Reset the chemin variable
    }
}
export {clearRoute};

//creer un ensemble avec tout des information pour calculer un prix de voiture
function creer () {
    let formData = {};
    formData.abonnement = abonnementCheckbox.checked;
    formData.aller = aller.checked;
    formData.ran = range.value;

    if (bKilo.disabled === true) {  //utilisateur a utilise la carte
        if (pos.length !== 2) {
            text.innerText = "Veuillez choisir un début et un fin sur la carte";
            return;
        } else {
            formData.kilo = km;
            formData.heures = temps;
        }
    }
    else {  //l'utilisateur ne touche pas la carte encore
        if (!((bKilo && bKilo.value.trim() !== '') || (bHeure && bHeure.value.trim() !==''))) {
            text.innerText = "Veuillez saisir toutes les informations requises";
            return;
        }
        else {
            formData.kilo = bKilo.value;
            formData.heures = bHeure.value;
            km = bKilo.value;
            temps = bHeure.value;
        }
    }

    const selectedCarSize = document.querySelector('input[name="car-size"]:checked');
    if (selectedCarSize) {
        formData.carSize = selectedCarSize.value;
    }

    const taille = Object.keys(formData).length;
    if (taille === 6) {
        etient(abonnementCheckbox, aller, range, map, carSizeRadios);
        const tup = totale (formData); //contient l'heure et le distance totale
        formData["kilo"] = tup.at(1);
        formData["heures"] = tup.at(0);
        if (formData["heures"] === "0" || formData["kilo"] === "0" ) {
            text.innerText = "Le prix pour touts des entreprises sont €0";
        }
        else {
            const prixCitiez = calculer(formData);
            const prixHertz = calcHertz(formData);
            lineGraph (formData, tup.at(0), tup.at(1));
            creerHeat(formData);
            text.innerText = "La distance à sens unique est: " + km + " km";
            text.innerText += "\nLe temps à sens unique est: " + temps + " Heures";
            text.innerText += "\nLe distance total est: " + tup.at(1) + " km";
            text.innerText += "\nLe temps total est: " + tup.at(0) + " Heures";
            text.innerText += "\nLe prix pour Citiez est: €" + prixCitiez;
            text.innerText += "\nLe prix pour Hertz est: €" + prixHertz;
            if (tup.at(0) / 24 <= 14 || tup.at(1) <= 1500) {
                formData.kilo = tup.at(1);
                formData.heures = tup.at(0);
                lineLeo(formData);
                const prixLeo = calculerLeo(formData);
                text.innerText += "\nLe prix pour Leo&Go est: €" + prixLeo;
            }
            else {
                text.innerText += text.innerText + "\nLe prix n'existe pas pour Leo&Go car l'heures ou/et le kilo est trop";
            }
        }
    }
    else {
        text.innerText = "Veuillez saisir toutes les informations requises";
    }
}