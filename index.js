// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 20, left: 20 },
  width = 900 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%Y-%m-%d");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin

const createTitle = () => {
  const title = d3
    .select("body")
    .append("div")
    .attr("id", "title")
    .html("Line Chart of Exchange Rate (1GBP vs HKD)");
};
createTitle();

const createLegend = () => {
  const footer = d3
    .select("body")
    .append("div")
    .attr("id", "legend")
    .html(
      `Date (x) vs HKD/GBP (y)<br/> Exchange rate referred to <a href="http://exchangerate.host">exchangerate.host</a>`
    );
};

const createStatistics = (dataset) => {
  var sortedData = JSON.parse(JSON.stringify(dataset)); 
  sortedData = sortedData.sort((a, b) => {
    if (a.y && b.y) {
      return a.y - b.y;
    }
  });

  let minValue = sortedData[0];
  let maxValue = sortedData[sortedData.length-1];
  let curValue = dataset[dataset.length-1];
  d3.select("body")
    .append("div")
    .attr("id","statistics")
    .html(`Min:  ${minValue["y"]} HKD/GBP on ${date2Str(new Date(minValue["x"]))}<br>
          Max:   ${maxValue["y"]} HKD/GBP on ${date2Str(new Date(maxValue["x"]))}<br>
          <span id="today">Now:   ${curValue["y"]} HKD/GBP on ${date2Str(new Date(curValue["x"]))}</span>
    `)
};


let svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let createTooltip = () => {
  return d3.select("body").append("div").attr("id", "tooltip");
};

// Get the data
let today = new Date();
today =
  today.getFullYear() +
  "-" +
  (today.getMonth() + 1 < 10
    ? "0" + (today.getMonth() + 1)
    : today.getMonth() + 1) +
  "-" +
  (today.getDate() < 10 ? "0" + today.getDate() : today.getDate());

let datefrom = new Date();
datefrom.setDate(datefrom.getDate() - 90);
datefrom =
  datefrom.getFullYear() +
  "-" +
  (datefrom.getMonth() + 1 < 10
    ? "0" + (datefrom.getMonth() + 1)
    : datefrom.getMonth() + 1) +
  "-" +
  (datefrom.getDate() < 10 ? "0" + datefrom.getDate() : datefrom.getDate());

let apiURL =
  "https://api.exchangerate.host/timeseries?start_date=" +
  datefrom +
  "&end_date=" +
  today +
  "&base=GBP&symbols=HKD";
fetch(apiURL)
  .then(function (response) {
    return response.json();
  })
  .then(function (myJson) {
    data = myJson.rates;
    var dataset = [];
    Object.entries(data).forEach(function (d) {
      if (d[1]["HKD"] !== undefined) {
        dataset.push({
          x: parseTime(d[0]),
          y: d[1]["HKD"],
        });
      }
    });

    // define the line
    var valueline = d3
      .line()
      .x(function (d) {
        return x(d.x);
      })
      .y(function (d) {
        return y(d.y);
      });

    // Scale the range of the data
    x.domain(
      d3.extent(dataset, function (d) {
        return d.x;
      })
    );

    y.domain([
      0,
      d3.max(dataset, function (d) {
        return d.y + 0.5;
      }),
    ]);

    // Add the valueline path.
    svg
      .append("path")
      .data([dataset])
      .attr("class", "line")
      .attr("d", valueline);

    // Add the x Axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3.axisBottom(x).ticks(d3.time).tickFormat(d3.timeFormat("%Y-%m-%d"))
      );

    createTooltip();
    createStatistics(dataset);

    // Add the y Axis
    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll("dot")
      .data(dataset)
      .enter()
      .append("circle")
      .style("fill", "gray")
      .attr("r", 3)
      .attr("cx", function (d) {
        return x(d.x);
      })
      .attr("cy", function (d) {
        return y(d.y);
      })
      .on("mouseover", (e, d) => {
        d3.select("#tooltip")
          .style("opacity", 0.85)
          .style("left", e.pageX + 5 + "px")
          .style("top", e.pageY + "px")
          // d3.timeFormat("%Y-%m-%d"

          .html(`<p>${date2Str(d.x)} <br> ${d.y} HKD/GBP</p>`)
          .attr("data-value", d.x + ", " + d.y);
        // console.log(d.x, d.y);
      })
      .on("mouseout", () => {
        return d3
          .select("#tooltip")
          .style("opacity", 0)
          .style("left", 0)
          .style("top", 0);
      });
  });

createLegend();

const date2Str = (dd) => {
  let dStr;
  if (dd instanceof Date && !isNaN(dd)) {
    dStr =
      dd.getFullYear() +
      "-" +
      (dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1) +
      "-" +
      (dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate());
    //console.log(dd.getDate())
  }
  return dStr;
};
