function init() {
  var screen = {width: 224, height: 288, bgColor: "black"},
      pacman = {x: 112, y: 216, radius: 10, color: "yellow"};

  var svg = d3.select("body").append("svg")
    .attr("width", screen.width)
    .attr("height", screen.height)
    .style("background-color", screen.bgColor);

  var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(function(p){console.log(p); return p.radius; })
    .startAngle(-Math.PI / 4)
    .endAngle(5/4 * Math.PI)(pacman);

  svg.append("g")
    .attr("transform", "translate(" + pacman.x + "," + pacman.y + ")")
    .append("path")
    .attr("d", arc)
    .style("fill", pacman.color);
}

ready(init);
