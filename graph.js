import {calculer} from "./calc.js";
import {calculerLeo} from "./calc.js";


const margin = {top: 70, right: 30, bottom: 40, left: 80};
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

let svg = d3.select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


let x;
let y;
let dataCitiez;
let dataLeo;
let dataDiff;

function lineGraph (formData, heures, kilo) {
    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    dataCitiez = [];

    for (let i = 0.2; i <= heures + 2; i += 0.2) {
        let temp = {};
        temp.heure = i;
        let data = {};
        data.abonnement = formData["abonnement"];
        data.aller = formData["aller"];
        data.ran = formData["ran"];
        data.kilo = kilo;
        data.heures = i;
        data.carSize = formData["carSize"];
        temp.prix = calculer(data);
        dataCitiez.push(temp);
    }

    x.domain(d3.extent(dataCitiez, (d) => d.heure));
    y.domain([-180, d3.max(dataCitiez, (d) => d.prix * 2)]);



    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y))

    const line = d3.line()
        .x(d => x(d.heure))
        .y(d => y(d.prix));

    svg.append("path")
        .datum(dataCitiez)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("d", line);


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .text("Le prix pour Chaque Heure Dans Un Intervalle de 0.2 heure pour le kilometre: " + kilo);


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 6)  // Adjusted y-position
        .attr("text-anchor", "middle")
        .text("L'Heure");

    // Add y-axis title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Le Prix (Euro)");


    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100},${margin.top})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "steelblue");

    legend.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text("Citiez");
    // Add a vertical line
    svg.append("line")
        .attr("x1", x(heures)) // x position of the line
        .attr("y1", 0) // starting from the top
        .attr("x2", x(heures)) // x position of the line
        .attr("y2", height) // ending at the bottom
        .attr("stroke", "red") // line color
        .attr("stroke-dasharray", "4") // dashed style
        .attr("stroke-width", 2); // line width
    //updateScales(dataset, dataLeo, x, y);
}
export {lineGraph};

function lineLeo(formData) {
    dataLeo = [];
    for (let i = 0.2; i <= formData["heures"] + 2; i += 0.2) {
        if (i / 24 <= 14 || formData["kilo"] <= 1500) {
            let temp = {};
            temp.heure = i;
            let data = {};
            data.abonnement = formData["abonnement"];
            data.aller = formData["aller"];
            data.ran = formData["ran"];
            data.kilo = formData["kilo"];
            data.heures = i;
            data.carSize = formData["carSize"];
            temp.prix = calculerLeo(data);
            //console.log("prix asdflkj: " + temp.prix);
            dataLeo.push(temp);
        }
    }
    const line = d3.line()
        .x((d) => x(d.heure))
        .y((d) => y(d.prix));

    svg.append("path")
        .datum(dataLeo)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 3)
        .attr("d", line);

    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100},${margin.top + 20})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "green");

    legend.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text("Leo&go");
    lineDiff();
}
export {lineLeo};

function lineDiff () {
    dataDiff = [];
    let min = 0;
    for (let i = 0; i < dataCitiez.length; i++) {
        let temp = {};
        temp.heure = dataCitiez[i].heure;
        const d = dataCitiez[i].prix - dataLeo[i].prix;
        if (d < min) {
            min = d;
        }
        temp.prix = d;// Compute the difference
        dataDiff.push(temp);
    }
    svg.select(".y-axis")
        .call(d3.axisLeft(y));
    const line = d3.line()
        .x((d) => x(d.heure))
        .y((d) => y(d.prix));

    svg.append("path")
        .datum(dataDiff)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 3)
        .attr("d", line);

    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100},${margin.top + 40})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", "orange"); // Color of the difference line

    legend.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text("Difference"); // Label for the difference line
}

function updateScales(dataCitiez, dataLeo, x, y) {
    const combinedData = [...dataCitiez, ...dataLeo];

    x.domain(d3.extent(combinedData, (d) => d.heure));
    y.domain([0, d3.max(combinedData, (d) => d.prix)]);
}

function clearGraph() {
    if (!svg.empty()) {
        svg.selectAll("*").remove();
    }
}
export {clearGraph};
