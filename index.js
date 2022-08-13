// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 50, left: 70 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%Y-%m-%d");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data

const createTooltip = () => {
  return d3.select("body").append("div").attr("id", "tooltip");
};

let apiURL =
  "https://api.exchangerate.host/timeseries?start_date=2022-08-01&end_date=2022-08-11&base=GBP&symbols=HKD";
fetch(apiURL)
  .then(function (response) {
    return response.json();
  })
  .then(function (myJson) {
    data = myJson.rates;
    var dataset = [];
    Object.entries(data).forEach(function (d) {
      dataset.push({
        x: parseTime(d[0]),
        y: d[1]["HKD"],
      });
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

      createTooltip()

    // Add the y Axis
    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll("dot")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("r", 4)
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
        // d3.timeFormat("%Y-%m-%d") 
        
        .html(`<p>${date2Str(d.x)} <br>\HKD ${d.y} / GBP</p>`)
        .attr("data-value", d.x + ", " + d.y)
        console.log(d.x,  d.y)

      })
      .on("mouseout",  () => {
        return d3
        .select("#tooltip")
        .style("opacity", 0)
        .style("left", 0)
        .style("top", 0);
      });
  });

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
