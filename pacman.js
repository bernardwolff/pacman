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
        {x1: 2, y1: 2, x2: 2, y2: 90},
        {x1: 7, y1: 6, x2: 7, y2: 86},
        {x1: 7, y1: 86, x2: 40, y2: 86},
        {x1: 2, y1: 86 + 4, x2: 36, y2: 90},
        {x1: 40, y1: 86, x2: 40, y2: 118},
        {x1: 36, y1: 86 + 4, x2: 36, y2: 114},
        {x1: 2, y1: 114, x2: 36, y2: 114},
        {x1: 2, y1: 118, x2: 40, y2: 118},
        {x1: 2, y1: 144, x2: 40, y2: 144},
        {x1: 2, y1: 148, x2: 36, y2: 148},
        {x1: 40, y1: 144, x2: 40, y2: 176},
        {x1: 36, y1: 148, x2: 36, y2: 172},
        {x1: 2, y1: 172, x2: 36, y2: 172},
        {x1: 7, y1: 176, x2: 40, y2: 176},
        {x1: 2, y1: 172, x2: 2, y2: 232},
        {x1: 7, y1: 176, x2: 7, y2: 232}
      ],
      num_pills = pills.length,
      selected_line = -1;


  var svg, arc, g, path;

  var pillStyle = function (d) { return d.eaten ? "black" : "peachpuff"; };

  function initSvg() {
    svg = d3.select("body")
      .append("svg")
      .attr("width", screen.width)
      .attr("height", screen.height)
      .style("background-color", screen.bgColor);
  }

  function moveLine(dp, line_index) {
    if (selected_line < 0) return false;
    var line = lines[line_index];
    line.x1 += dp.x1;
    line.x2 += dp.x2;
    line.y1 += dp.y1;
    line.y2 += dp.y2;
    updateLines();
    console.log("moved line to " + JSON.stringify(line))
    return true;
  }

  function bindKeyDownEvent() {
    d3.select("body")
      .on("keydown", function() {
        console.log("key pressed " + d3.event.keyCode);
        var move = false, moved_line = false;
        switch (d3.event.keyCode){
          case SPACE:
            stopMoving();
            return;
          case 70: // f = move to next Frame of animation
            movePacman();
            return;
          case 78: // n = select Next line
            if (selected_line > -1) lines[selected_line].selected = false;
            selected_line = (selected_line + 1) % lines.length;
            var line = lines[selected_line];
            console.log("selected line: " + JSON.stringify(line));
            line.selected = true;
            updateLines();
            return;
          case 68: // d = Deselect selected line
            if (selected_line < 0) return;
            lines[selected_line].selected = false;
            selected_line = -1;
            updateLines();
            return;
          case 71: // g = Grow selected line
            if (selected_line < 0) return;
            var line = lines[selected_line];
            if (line.x1 === line.x2) // vertical line
              line.y2++;
            if (line.y1 === line.y2) // horizontal line
              line.x2++;
            updateLines();
            return;
          case 83: // s = Shrink selected line
            if (selected_line < 0) return;
            var line = lines[selected_line];
            if (line.x1 === line.x2) // vertical line
              line.y2--;
            if (line.y1 === line.y2) // horizontal line
              line.x2--;
            updateLines();
            return;
          case 82: // r = Rotate selected line 180 degrees
            if (selected_line < 0) return;
            var line = lines[selected_line];
            var rotated = rotate_line(line, Math.PI);
            line.x1 = rotated.x1;
            line.y1 = rotated.y1;
            line.x2 = rotated.x2;
            line.y2 = rotated.y2;
            updateLines();
            return;
          case 80: // p = Place a new line on the board
            lines.push({"x1":68,"y1":125,"x2":150,"y2":125,"selected":true});
            selected_line = lines.length - 1;
            drawLines();
            return;
          case LEFT:
            move = true;
            moved_line = moveLine({x1: -1, y1: 0, x2: -1, y2: 0}, selected_line);
            break;
          case RIGHT:
            move = true;
            moved_line = moveLine({x1: 1, y1: 0, x2: 1, y2: 0}, selected_line);
            break;
          case UP:
            move = true;
            moved_line = moveLine({x1: 0, y1: -1, x2: 0, y2: -1}, selected_line);
            break;
          case DOWN:
            move = true;
            moved_line = moveLine({x1: 0, y1: 1, x2: 0, y2: 1}, selected_line);
            break;
        }

        if (!move || moved_line) return;

        var desiredRotateAngle = keys[d3.event.keyCode];
        if (desiredRotateAngle === undefined) return;
        pacman.desiredRotateAngle = desiredRotateAngle;
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

  function updatePills () {
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

  function drawLines(){
    var borders = svg.selectAll("line")
      .data(lines)
      .enter()
      .append("line");

    updateLines(borders);
  }

  function updateLines(lines)
  {
    var toUpdate = lines ? lines : svg.selectAll("line");

    var lineAttribs = toUpdate
      .attr("x1", function (d) { return d.x1; })
      .attr("y1", function (d) { return d.y1; })
      .attr("x2", function (d) { return d.x2; })
      .attr("y2", function (d) { return d.y2; })
      .attr("stroke-width", 2)
      .attr("stroke", function (d) {return d.selected ? "red" : "blue"; });
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
        pacman.rotateAngle = pacman.desiredRotateAngle;
        positionPacman();
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
      // here we are using margin to do collision detection with a smaller rect
      if (collision_point_rect(pill, {
        x1: pacman.x - pacman.radius + pacman.margin,
        x2: pacman.x + pacman.radius - pacman.margin,
        y1: pacman.y - pacman.radius + pacman.margin,
        y2: pacman.y + pacman.radius - pacman.margin
      })) {
        eatPill(pill);
      }
    });
  }

  initSvg();
  drawPills();
  drawLines();
  drawPacman();
  positionPacman();
  startMoving();
  bindKeyDownEvent();
}

ready(init);
