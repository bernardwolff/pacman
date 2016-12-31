function init() {
  var screen = {width: 224, height: 288, bgColor: "black", mouthOpen: true},
      pacman = {x: 112, y: 216, radius: 10, color: "yellow", mouthOpen: true};

  var svg = d3.select("body").append("svg")
    .attr("width", screen.width)
    .attr("height", screen.height)
    .style("background-color", screen.bgColor);

  var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(function (p) { return p.radius; })
    .startAngle(function (p) {
      if (p.mouthOpen) return -Math.PI / 4;
      else return -Math.PI / 2;
    })
    .endAngle(function (p) {
      if (p.mouthOpen) return 5/4 * Math.PI;
      else return 3 * Math.PI / 2;
    });

  var p_element = svg.append("g")
    .attr("transform", "translate(" + pacman.x + "," + pacman.y + ")")
    .append("path")
    .attr("d", arc(pacman))
    .style("fill", pacman.color);

  d3.interval(function() {
    pacman.mouthOpen = !pacman.mouthOpen;
    p_element.transition()
        .duration(1)
        .attrTween("d", function (d) {
          return function(t) {
            return arc(pacman);
          }
        });
  }, 100);


}

ready(init);
