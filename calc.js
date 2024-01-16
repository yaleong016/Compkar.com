function totale (formData) {
    let heures = formData["heures"];
    let kilo = formData["kilo"];
    const aller = formData["aller"];
    const range = formData["ran"];
    if (aller) {
        heures = heures * 2;
        kilo = kilo * 2;
    }
    heures = heures * (1 + range/100);
    kilo = kilo * (1 + range/100);
    // console.log("heure" + heures);
    // console.log("km" + kilo);
    return [heures, kilo];
}

export {totale};

function calculerCitiez(formData) {
    const taille = formData["carSize"];
    const abonnement = formData["abonnement"];
    let kilo = formData["kilo"];
    let heures = formData["heures"];

    let prixTaille = attribTaille(taille, abonnement);
    //console.log(prixTaille);
    let prixVoiture = calPrixVoit(heures, prixTaille);
    //console.log(prixVoiture);

    // For Kilometre
    if (taille === "XL" || taille === "XXL") {
        if (kilo > 100) {
            prixVoiture += 0.27 * (kilo - 100); // more than 100km
            prixVoiture += 0.51 * 100; // plus the first 100km at the normal price
        } else {
            prixVoiture += 0.51 * kilo;
        }
    } else {
        if (kilo > 100) {
            prixVoiture += 0.22 * (kilo - 100);
            prixVoiture += 0.41 * 100;
        } else {
            prixVoiture += 0.41 * kilo;
        }
    }

    return prixVoiture;
}
function calculer (formData) {
    const heureOrignal = formData["heures"];
    const prixExact = calculerCitiez(formData);

    let i = 24;
    while (i < heureOrignal) {
        i += 24;
    }
    formData["heures"] = i;
    const prixJour = calculerCitiez(formData);

    i = 168;
    while (i < heureOrignal) {
        i += 168;
    }
    formData["heures"] = i;
    const prixSemaine = calculerCitiez(formData);
    formData["heures"] = heureOrignal;
    return Math.min(prixExact, prixJour, prixSemaine);
}
export {calculer};

function attribTaille(taille, abonnement) {
    if (!abonnement) {
        if (taille === "S") {
            return [5, 39, 180];
        } else if (taille === "M") {
            return [5.5, 45, 210];
        } else if (taille === "L") {
            return [6, 50, 240];
        } else if (taille === "XL") {
            return [6.5, 56, 270];
        } else if (taille === "XXL") {
            return [7, 60, 300];
        }
    } else {
        if (taille === "S") {
            return [2.5, 22, 120];
        } else if (taille === "M") {
            return [3, 27, 150];
        } else if (taille === "L") {
            return [3.5, 32, 180];
        } else if (taille === "XL") {
            return [4, 38, 210];
        } else if (taille === "XXL") {
            return [4.5, 44, 240];
        }
    }
}

function calPrixVoit(heures, prixTaille) {
    let prix = 0.0;
    if (heures >= 168) {
        const numSem = Math.floor(heures / 168);
        prix += numSem * prixTaille[2];
        heures = heures % 168;
        //console.log("after semaine heures: " + heures);
        //console.log("prix: " + prix);
    }
    if (heures >= 24) {
        const numJour = Math.floor(heures / 24);
        prix += numJour * prixTaille[1];
        heures = heures % 24;
        //console.log("after semaine heures: " + heures);
        //console.log("prix: " + prix);
    }
    if (heures >= 1) {
        prix += heures * prixTaille[0];
        //console.log("after semaine heures: " + heures);
        //console.log("prix: " + prix);
    }
    return prix;
}

function calculerLeo (formData) {
    const consommation = formData["kilo"] * 0.30;
    const timeKmData = [
        //les entities sont: temps (heures et jours), kilometre, et prix
        [1, 13],
        [2, 22],
        [3, 27],
        [6, 42],
        [9, 53],  //le premier cinq entities sont a propos des heures, pas de jours
        ["1", "200", 65],
        ["2", "300", 119],
        ["3", "400", 169],
        ["4", "500", 209],
        ["5", "600", 249],
        ["6", "700", 289],
        ["7", "800", 329],
        ["8", "900", 369],
        ["9", "1000", 409],
        ["10", "1100", 449],
        ["11", "1200", 489],
        ["12", "1300", 529],
        ["13", "1400", 569],
        ["14", "1500", 609]
    ];
    let kilo = formData["kilo"];
    let heures = formData["heures"];
    //console.log("heures pre: " + heures);

    //si kilo <= 100 et heures <=9, il y a un facon different pour calculer le prix
    if (kilo <= 100 && heures <= 9) {
        for (let i = 0; i < 5; i++) {
            const array = timeKmData[i];
            if (array[0] >= heures) {  //si l'heures est ou egal que l'heures le client saisit, retourner le prix
                return array[1];
            }
        }
    }
    //si heures est plus que 9, ou kilo est plus que 100:

    //nous arrondissons les heures
    if (heures % 24 !== 0) {
        heures = Math.floor(formData["heures"] / 24) + 1;
    }
    else {
        heures = heures / 24;
    }
    //console.log("heure leo: " + heures);
    for (let i = 5; i < timeKmData.length; i++) {
        const array = timeKmData[i];
        if (array[0] >= heures && array[1] >= kilo) {
            //console.log("kilo leo: " + kilo);
            //console.log("prix: " + array[2])
            return array[2] + consommation;
        }
    }
}
export{calculerLeo};


function calcHertz (formData) {
    let prixList = [];
    prixList.S = [51.74, 362.18];
    prixList.M = [57.49, 402.43];
    prixList.L = [65.75, 460.25];
    prixList.XL = [80.21, 550.72];
    prixList.XXL = [97.25, 680.75];

    let kil = formData["kilo"];
    let heure = formData["heures"];
    const prix = prixList[formData["carSize"]];
    let prixTotal = 0;
    let consommation = 0;
    if (kil >= 100) {
        consommation = formData["kilo"] * 0.20;
    }
    //console.log(prix);
    let jour = Math.floor(heure / 24) + 1;

    //plus qu'une semaine
    if (jour / 7 >= 1) {
        prixTotal += (jour / 7) * prix.at(1);
        jour = jour % 7;
    }

    if (jour * prix.at(0) > prix.at(1)) {
        prixTotal += prix.at(1);
    }
    else {
        prixTotal += jour * prix.at(0);
    }
    return prixTotal + consommation;

}
export {calcHertz};