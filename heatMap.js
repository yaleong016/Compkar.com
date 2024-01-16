import {calculer} from "./calc.js";
import {calculerLeo} from "./calc.js";
import {calcHertz} from "./calc.js";


const margin = {top: 80, right: 25, bottom: 90, left: 100},
    width = 525 - margin.left - margin.right,
    height = 525 - margin.top - margin.bottom;

const margin1 = { top: 20, right: 20, bottom: 40, left: 40 },
      width1 = 300 - margin1.left - margin1.right,
      height1 = 300 - margin1.top - margin1.bottom;

// append the svg object to the body of the page
const svg = d3.select("#HeatMap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const leg = d3.select("#legend")
    .append("svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom)
    .append("g")
    .attr("transform", `translate(${margin1.left}, ${margin1.top})`);

function creerLegend() {
    const xData = [2,4,8,16,32,64,128,256,512,1024];
    const yData = [2,4,8,16,32,64,128,256,512,1024];
    const results = legRes(xData, yData);

    const x = d3.scaleBand()
        .range([ 0, width1 ])
        .domain(xData)
        .padding(0.05);
    leg.append("g")
        .style("font-size", 10)
        .attr("transform", `translate(0, ${height1})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()

    // Build Y scales and axis:
    const y = d3.scaleBand()
        .range([ height1, 0 ])
        .domain(yData)
        .padding(0.05);
    leg.append("g")
        .style("font-size", 10)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()

    let minValue = Math.min(...results);
    let maxValue = Math.max(...results);

    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([minValue, maxValue]);
    // const colorScale = d3.scaleSequential()
    //     .interpolator(d3.interpolateInferno)
    //     .domain([d3.min(results), d3.max(results)]);

    // create a tooltip
    const tooltip = d3.select("#legend")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event,d) {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    const mousemove = function(event,d) {
        tooltip
            .html("Le prix est: " + d.value + "€")
            .style("left", (event.x)/2 + "px")
            .style("top", (event.y)/2 + "px")
    }
    const mouseleave = function(event,d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    const heatmapData = [];
    results.forEach((result, i) => {
        heatmapData.push({
            xValue: xData[Math.floor(i / yData.length)],
            yValue: yData[i % yData.length],
            value: result
        });
    });

    leg.selectAll("rect")
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.xValue))
        .attr("y", d => y(d.yValue))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => colorScale(d.value))
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

// Add title to graph
    leg.append("text")
        .attr("x", width1 / 2)
        .attr("y", -margin1.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Le prix Generaux pour Citiez");

    leg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin1.left)
        .attr("x", 0 - (height1 / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Heures");

// Add X-axis title
    leg.append("text")
        .attr("x", width1 / 2)
        .attr("y", height1 + margin1.top)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Kilometres");

}
export {creerLegend};
function creerHeat (formData) {
    const kilo = formData["kilo"];
    const heure = formData["heures"];
    //obtient les ensembles avec kilo, heures divisent par 10 incremental
    let xData = getTenth(kilo);
    const yData = getTenth(heure);

    //trouve les prix pour le dix valeurs de prix et heures
    let dataCitiez = citiez(formData, xData, yData);
    // console.log(dataCitiez);

    //si le data pour citiez existe, on le consider aussi
    if (heure / 24 <= 14 || kilo <= 1500) {
        const dataLeo = leo(formData, xData, yData);
        // console.log(dataLeo);
        dataCitiez = findMin(dataCitiez, dataLeo);
    }
    const dataHertz = hertz(formData, xData, yData);
    // console.log(dataHertz);
    const results = findMin(dataCitiez,dataHertz);
    xData = truncate(xData);
    const yLabel = convert(yData);

    // Build X scales and axis:
    const x = d3.scaleBand()
        .range([ 0, width ])
        .domain(xData)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()

    // Build Y scales and axis:
    const y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(yData)
        .padding(0.05);
    const y1 = d3.scaleBand()
        .range([height, 0])
        .domain(yLabel)
        .padding(0.05);

    svg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y1).tickSize(0))
        .select(".domain").remove()
    // Build color scale
    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([d3.min(results), d3.max(results)]);

    // create a tooltip
    const tooltip = d3.select("#HeatMap")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event,d) {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    const mousemove = function(event,d) {
        tooltip
            .html("Le prix est: " + d.value + "€")
            .style("left", (event.x)/2 + "px")
            .style("top", (event.y)/2 + "px")
    }
    const mouseleave = function(event,d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    const heatmapData = [];
    results.forEach((result, i) => {
        heatmapData.push({
            xValue: xData[Math.floor(i / yData.length)],
            yValue: yData[i % yData.length],
            value: result
        });
    });

    svg.selectAll("rect")
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.xValue))
        .attr("y", d => y(d.yValue))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => colorScale(d.value))
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

// Add title to graph
    svg.append("text")
        .attr("x", -100)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("Graphe montre le prix min dans chaque cas de kilo et Minutes");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Minutes");

// Add X-axis title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top - 30)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Kilometres");
}
export {creerHeat};

function citiez(formData, x, y) {
    var result = [];
    for (let i = 0; i < 10; i++) {
        for (let j  = 0; j < 10; j++) {
            const kilo = x.at(i);
            const heure = y.at(j);
            let data = {};
            data.abonnement = formData["abonnement"];
            data.aller = formData["aller"];
            data.ran = formData["ran"];
            data.kilo = kilo;
            data.heures = heure;
            data.carSize = formData["carSize"];
            result.push(calculer(data).toFixed(3));
        }
        //console.log("partial " + temp);
    }
    return result;
}
function leo (formData, x, y) {
    var result = [];
    for (let i = 0; i < 10; i++) {
        for (let j  = 0; j < 10; j++) {
            const kilo = x.at(i);
            const heure = y.at(j);
            let data = {};
            data.abonnement = formData["abonnement"];
            data.aller = formData["aller"];
            data.ran = formData["ran"];
            data.kilo = kilo;
            data.heures = heure;
            data.carSize = formData["carSize"];
            result.push(calculerLeo(data).toFixed(3));
        }
        //console.log("partial " + temp);
    }
    return result;
}
function hertz (formData, x, y) {
    var result = [];
    for (let i = 0; i < 10; i++) {
        for (let j  = 0; j < 10; j++) {
            const kilo = x.at(i);
            const heure = y.at(j);
            let data = {};
            data.abonnement = formData["abonnement"];
            data.aller = formData["aller"];
            data.ran = formData["ran"];
            data.kilo = kilo;
            data.heures = heure;
            data.carSize = formData["carSize"];
            result.push(calcHertz(data).toFixed(3));
        }
        //console.log("partial " + temp);
    }
    return result;
}

function getTenth (val) {
    const tenth = val / 10;
    var count = tenth;
    var result = [];
    for (let i = 0; i < 10; i++) {
        result.push(count.toFixed(3));
        count += tenth;
    }
    return result;
}

function findMin(d1, d2) {
    var result = [];
    for (let i = 0; i < d1.length; i++) {
        const min = Math.min(d1.at(i), d2.at(i));
        result.push(min);
    }
    return result;
}

function truncate (arr) {
    var result = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(Number(arr.at(i)).toFixed(0));
    }
    return result;
}
function convert (arr) {
    var result = [];
    for (let i = 0; i < arr.length; i++) {
        result.push ((arr.at(i) * 60).toFixed(2));
    }
    return result;
}
function clearHeat() {
    if (!svg.empty()) {
        svg.selectAll("*").remove();
    }
}

function legRes(x, y) {
    var result = [];
    for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < y.length; j++) {
            const kilo = x.at(i);
            const heure = y.at(j);
            let data = {};
            data.abonnement = false;
            data.aller = false;
            data.ran = 0;
            data.kilo = kilo;
            data.heures = heure;
            data.carSize = "M";
            result.push(calculer(data).toFixed(3));
        }
    }
    return result;
}
export {clearHeat};