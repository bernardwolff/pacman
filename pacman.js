function init() {
  var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
  var keys = {};
  keys[LEFT] = -90;
  keys[UP] = 0;
  keys[RIGHT] = 90;
  keys[DOWN] = 180;

  var MOVE_AMOUNT = 1;

  var screen = {width: 224, height: 288, bgColor: "black", mouthOpen: true},
      pacman = {
        x: 112,
        y: 216,
        radius: 10,
        color: "yellow",
        mouthOpen: true,
        direction: LEFT,
        rotateAngle: -90,
        translate: function(){
          return "translate(" + this.x + "," + this.y + ")"
            + "rotate(" + this.rotateAngle + ")"
        }
      };

  var svg = d3.select("body")
    .append("svg")
    .attr("width", screen.width)
    .attr("height", screen.height)
    .style("background-color", screen.bgColor);

  var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(function (p) { return p.radius; })
    .startAngle(function (p) {
      if (p.mouthOpen) return Math.PI / 4;
      else return 0;
    })
    .endAngle(function (p) {
      if (p.mouthOpen) return 7 * Math.PI / 4;
      else return 2 * Math.PI;
    });

  var g = svg.append("g")
    .attr("transform", pacman.translate());

  var path = g.append("path")
    .attr("d", arc(pacman))
    .style("fill", pacman.color);

  d3.interval(function () {
    pacman.mouthOpen = !pacman.mouthOpen;
    path.attr("d", arc(pacman));
  }, 80);

  d3.interval(function() {
    switch (pacman.direction) {
      case LEFT:
        pacman.x = Math.max(pacman.x - MOVE_AMOUNT, pacman.radius);
        break;
      case UP:
        pacman.y = Math.max(pacman.y - MOVE_AMOUNT, pacman.radius);
        break;
      case RIGHT:
        pacman.x = Math.min(pacman.x + MOVE_AMOUNT, screen.width - pacman.radius);
        break;
      case DOWN:
        pacman.y = Math.min(pacman.y + MOVE_AMOUNT, screen.height - pacman.radius);
        break;
    }
    g.attr("transform", pacman.translate());
  }, 20);

  d3.select("body")
    .on("keydown", function() {
      pacman.rotateAngle = keys[d3.event.keyCode];
      pacman.direction = d3.event.keyCode;
      g.attr("transform", pacman.translate());
    });
}

ready(init);
