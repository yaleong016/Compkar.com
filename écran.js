import {onMapClick} from "./main.js";
import {clearRoute} from "./main.js";
import {clearGraph} from "./graph.js";
import {clearHeat} from "./heatMap.js";

const graph = document.getElementById("chartContainer");
const heat = document.getElementById("HeatMapContainer");
function etient (abonnementCheckbox, aller, range, map, carSizeRadios) {
    // Clear and disable the abonnement checkbox
    abonnementCheckbox.checked = false;
    abonnementCheckbox.disabled = true;
    range.disabled = true;

    aller.checked = false;
    aller.disabled = true;

    map.off('click', onMapClick);
    // Deselect and disable all carSize radio buttons
    carSizeRadios.forEach(radio => {
        radio.checked = false;
        radio.disabled = true;
    });
    graph.style.display = "flex";
    heat.style.display = "flex";
}
export {etient};



function allumer (abonnementCheckbox, aller, range, rtext, times, pos, marker1, marker2, map, carSizeRadios, text) {
    abonnementCheckbox.checked = false;
    abonnementCheckbox.disabled = false;
    aller.checked = false;
    aller.disabled = false;

    range.disabled = false;
    rtext.textContent = "50%";

    times = 0;
    pos = [];
    if (marker1 !== undefined) {
        map.removeLayer(marker1);
    }
    if (marker2 !== undefined) {
        map.removeLayer(marker2);
    }
    clearRoute();
    map.on('click', onMapClick);


    // Deselect and disable all carSize radio buttons
    carSizeRadios.forEach(radio => {
        radio.checked = false;
        radio.disabled = false;
    });
    text.innerText = "";
    clearGraph();
    clearHeat();
    graph.style.display = "none";
    heat.style.display = "none";
}
export {allumer};
