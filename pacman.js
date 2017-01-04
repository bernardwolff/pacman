function init() {
  var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, SPACE = 32;
  var keys = {};
  keys[LEFT] = -90;
  keys[UP] = 0;
  keys[RIGHT] = 90;
  keys[DOWN] = 180;

  var MOVE_AMOUNT = 1, PILL_SIZE = 3;

  var screen = {width: 224, height: 288, bgColor: "black", mouthOpen: true},
      pacman = {
        x: screen.width / 2,
        y: screen.height / 2 + screen.height / 4,
        margin: 2,
        radius: 10,
        color: "yellow",
        mouthOpen: true,
        direction: LEFT,
        rotateAngle: -90,
        desiredDirection: LEFT,
        desiredRotateAngle: -90,
        translate: function(){
          return "translate(" + this.x + "," + this.y + ")"
            + "rotate(" + this.rotateAngle + ")"
        }
      },
      pills = [
        {x: 20, y: 216},
        {x: 30, y: 216},
        {x: 50, y: 216},
        {x: 60, y: 216},
        {x: 70, y: 216},
        {x: 80, y: 216},
        {x: 90, y: 216}
      ],
      lines = [
        {x1: 2, y1: 2, x2: 112, y2: 2},
        {x1: 7, y1: 6, x2: 112 - 4, y2: 6},
        {x1: 112 - 4, y1: 6, x2: 112 - 4, y2: 36},
        {x1: 112 - 4, y1: 36, x2: 112, y2: 36},
        {x1: 2, y1: 2, x2: 2, y2: 96 + 4},
        {x1: 7, y1: 6, x2: 7, y2: 96},
        {x1: 7, y1: 96, x2: 40, y2: 96},
        {x1: 2, y1: 96 + 4, x2: 36, y2: 96 + 4},
        {x1: 40, y1: 96, x2: 40, y2: 128},
        {x1: 36, y1: 96 + 4, x2: 36, y2: 124},
        {x1: 2, y1: 124, x2: 36, y2: 124},
        {x1: 2, y1: 128, x2: 40, y2: 128},
        {x1: 2, y1: 154, x2: 40, y2: 154},
        {x1: 2, y1: 158, x2: 36, y2: 158},
        {x1: 40, y1: 154, x2: 40, y2: 186},
        {x1: 36, y1: 158, x2: 36, y2: 182},
        {x1: 2, y1: 182, x2: 36, y2: 182},
        {x1: 2, y1: 186, x2: 40, y2: 186}
      ],
      num_pills = pills.length;


  var svg, arc, g, path;

  var pillStyle = function (d) { return d.eaten ? "black" : "peachpuff"; };

  function initSvg() {
    svg = d3.select("body")
      .append("svg")
      .attr("width", screen.width)
      .attr("height", screen.height)
      .style("background-color", screen.bgColor);
  }

  function bindKeyDownEvent() {
    d3.select("body")
      .on("keydown", function() {
        if (d3.event.keyCode === SPACE) {
          stopMoving();
          return;
        }
        if (d3.event.keyCode === 82) { // r
          movePacman();
          return;
        }
        var rotateAngle = keys[d3.event.keyCode];
        if (rotateAngle === undefined) return;
        pacman.desiredRotateAngle = keys[d3.event.keyCode];
        pacman.desiredDirection = d3.event.keyCode;
        positionPacman();
        startMoving();
      });
  }

  function drawPills(){
    var rects = svg.selectAll("rect")
      .data(pills)
      .enter()
      .append("rect");

    var rectAttribs = rects
      .attr("x", function (d) { return d.x; })
      .attr("y", function (d) { return d.y; })
      .attr("width", PILL_SIZE)
      .attr("height", PILL_SIZE)
      .style("fill", pillStyle);
  }

  function updatePills (index) {
    svg.selectAll("rect")
        .style("fill", pillStyle);
  }

  function eatPill (pill) {
    pill.eaten = true;
    num_pills--;
    updatePills();

    if (num_pills <= 0) {
      var text = svg
            .append("text")
            .attr("x", 30)
            .attr("y", screen.height / 2)
            .text("you ate all the pills!")
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "white");
      stopMoving();
    }
  }

  function drawBorders(){
    var borders = svg.selectAll("line")
      .data(lines)
      .enter()
      .append("line");

    var lineAttribs = borders
      .attr("x1", function (d) { return d.x1; })
      .attr("y1", function (d) { return d.y1; })
      .attr("x2", function (d) { return d.x2; })
      .attr("y2", function (d) { return d.y2; })
      .attr("stroke-width", 2)
      .attr("stroke", "blue");
  }

  function drawPacman() {
    arc = d3.arc()
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

    g = svg.append("g");
    path = g.append("path")
      .attr("d", arc(pacman))
      .style("fill", pacman.color);
  }

  function positionPacman() {
    g.attr("transform", pacman.translate());
  }

  function drawPacmanMouth() {
    path.attr("d", arc(pacman));
  }

  var eat = null, move = null;
  function startMoving() {
    if (eat === null) eat = d3.interval(function() {
      pacman.mouthOpen = !pacman.mouthOpen;
      drawPacmanMouth();
    }, 80);
    if (move === null) move = d3.interval(function() {
      movePacman();
      eatPills();
    }, 20);
  }

  function stopMoving() {
    if (eat !== null) {
      eat.stop();
      eat = null;
    }
    if (move !== null) {
      move.stop();
      move = null;
    }

    pacman.mouthOpen = true;
    drawPacmanMouth();
  }

  function crossedBoundary(newx, newy) {
    var radius = pacman.radius + pacman.margin;
    var crossedLine = lines.some(function(line){
      //return collision_line_circle(line, {x: newx, y: newy, radius: pacman.radius + pacman.margin});
      return collision_line_rect(line, {
        x1: newx - radius,
        x2: newx + radius,
        y1: newy - radius,
        y2: newy + radius
      });
    });

    return crossedLine;
  }

  function getNewCoords(direction) {
    var newx = pacman.x, newy = pacman.y;
    switch (direction) {
      case LEFT:
        newx = pacman.x - MOVE_AMOUNT;
        break;
      case UP:
        newy = pacman.y - MOVE_AMOUNT;
        break;
      case RIGHT:
        newx = pacman.x + MOVE_AMOUNT;
        break;
      case DOWN:
        newy = pacman.y + MOVE_AMOUNT;
        break;
    }

    // reappear on the opposite side
    newx = newx + pacman.radius <= 0 ? screen.width + pacman.radius :
      newx - pacman.radius >= screen.width ? -pacman.radius : newx;
    newy = newy + pacman.radius <= 0 ? screen.height + pacman.radius :
      newy - pacman.radius >= screen.height ? -pacman.radius : newy;

    return {x: newx, y: newy};
  }

  function movePacman() {
    var coords = getNewCoords(pacman.desiredDirection);
    var angle = pacman.desiredRotateAngle;
    var direction = pacman.desiredDirection;

    if (crossedBoundary(coords.x, coords.y)){
      coords = getNewCoords(pacman.direction);
      angle = pacman.rotateAngle;
      direction = pacman.direction;

      if (crossedBoundary(coords.x, coords.y)){
        stopMoving();
        return;
      }
    }

    pacman.rotateAngle = angle;
    pacman.direction = direction;
    pacman.x = coords.x;
    pacman.y = coords.y;
    positionPacman();
  }

  function eatPills() {
    pills.forEach(function(pill) {
      if (pill.eaten) return;
      if (collision_point_rect(pill, {
        x1: pacman.x - pacman.radius - pacman.margin,
        x2: pacman.x + pacman.radius + pacman.margin,
        y1: pacman.y - pacman.radius - pacman.margin,
        y2: pacman.y + pacman.radius + pacman.margin
      })) {
        eatPill(pill);
      }
    });
  }

  initSvg();
  drawPills();
  drawBorders();
  drawPacman();
  positionPacman();
  startMoving();
  bindKeyDownEvent();
}

ready(init);
