const movies =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const margin = { top: 10, right: 10, bottom: 10, left: 10 };
const width = 960;
const height = 550;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.left - margin.right;

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

const treemap = d3.treemap().size([width, height]).paddingInner(1);

const color = d3.scaleOrdinal(d3.schemePaired);

d3.json(movies).then((data) => {
  let categories = new Set();

  const root = d3
    .hierarchy(data)
    .eachAfter((d) => d.data.category && categories.add(d.data.category))
    .sum((data) => data.value)
    .sort(
      (a, b) =>
        d3.descending(a.height, b.height) || d3.descending(a.value, b.value)
    );

  categories = Array.from(categories);

  treemap(root);

  const cells = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

  // Tiles
  cells
    .append("rect")
    .attr("class", "tile")
    .attr("id", (d, i) => d.data.value + "-" + i)
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => color(d.data.category))
    .on("mousemove", (e, d) => {
      tooltip.style("opacity", 0.8);
      tooltip
        .attr("data-value", d.data.value)
        .style("top", e.clientY + "px")
        .style("left", e.clientX + 5 + "px").html(`Name: ${d.data.name}<br/>
                                Category: ${d.data.category}<br/>
                                Value: ${d.data.value}`);
    })
    .on("mouseout", (e, d) => tooltip.style("opacity", 0));

  // Clip Path for unwrapping text
  cells
    .append("clipPath")
    .attr("id", (d, i) => "clip-" + d.data.value + "-" + i)
    .append("use")
    .attr("href", (d, i) => "#" + d.data.value + "-" + i);

  // Tiles Text
  cells
    .append("text")
    .attr("clip-path", (d, i) => `url(#clip-${d.data.value}-${i})`)
    .selectAll("tspan")
    .data((d) => d.data.name.split(" "))
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", (d, i) => 10 + i * 10)
    .text((d) => d);

  // Legend
  const legendWidth = width - 100;
  const horizontalSpacing = 120;
  const verticalSpacing = 30;
  const elemPerRows = Math.floor(legendWidth / horizontalSpacing);
  const rectSize = 25;
  const offsetX = rectSize + 5;
  const offsetY = rectSize / 2 + 4;

  const legendSVG = d3
    .select("body")
    .append("svg")
    .attr("width", legendWidth)
    .attr("transform", "translate(0, 15)");

  const legend = legendSVG.append("g").attr("id", "legend");
  const legendGroups = legend
    .selectAll(".legendGroup")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "legendGroup")
    .attr(
      "transform",
      (d, i) =>
        `translate(${(i % elemPerRows) * horizontalSpacing}, ${
          Math.floor(i / elemPerRows) * rectSize +
          verticalSpacing * Math.floor(i / elemPerRows)
        })`
    );

  legendGroups
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", rectSize)
    .attr("height", rectSize)
    .attr("fill", (d) => color(d));

  legendGroups
    .append("text")
    .attr("class", "legend-text")
    .attr("x", offsetX)
    .attr("y", offsetY)
    .text((d) => d);
});
