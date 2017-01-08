function init() {
  var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, SPACE = 32;
  var keys = {};
  keys[LEFT] = -90;
  keys[UP] = 0;
  keys[RIGHT] = 90;
  keys[DOWN] = 180;

  var MOVE_AMOUNT = 1, PILL_SIZE = 2;

  var screen = {width: 224, height: 288, bgColor: "black", mouthOpen: true},
      pacman = {
        x: 112,
        y: 212,
        margin: 1,
        radius: 6,
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
        {x: 10, y: 212},
        {x: 18, y: 212},
        {x: 26, y: 212},
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
    if (line_index < 0) return false;
    var line = lines[line_index];
    line.x1 += dp.x1;
    line.x2 += dp.x2;
    line.y1 += dp.y1;
    line.y2 += dp.y2;
    updateLines();
    console.log("moved line to " + JSON.stringify(line))
    return true;
  }

  function bindMouseMoveEvent() {
    var w = d3.select("svg")
      .on("click", function(){
        unselect_selected_line();

        var index = -1;
        // add 1 extra pixel around mouse to make it easier to select the line
        var rect = {x1: d3.event.offsetX - 1, y1: d3.event.offsetY - 1,
          x2: d3.event.offsetX + 1, y2: d3.event.offsetY + 1};
        var line = lines.find(function(line) {
          index++;
          return collision_line_rect(line, rect);
        });

        if (line) {
          select_line(index);
        }
      });
  }

  function unselect_selected_line() {
    if (selected_line < 0) return;
    lines[selected_line].selected = false;
    selected_line = -1;
    updateLines();
  }

  function select_line(index) {
    if (selected_line > -1) lines[selected_line].selected = false;
    selected_line = index;
    var line = lines[selected_line];
    line.selected = true;
    console.log("selected line: " + JSON.stringify(line));
    updateLines();
  }

  function bindKeyDownEvent() {
    d3.select("body")
      .on("keydown", function() {
        console.log("key pressed " + d3.event.keyCode);
        var move = false;
        switch (d3.event.keyCode){
          case SPACE:
            stopMoving();
            return;
          case 70: // f = move to next Frame of animation
            movePacman();
            eatPills();
            return;
          case 78: // n = select Next line
            select_line((selected_line + 1) % lines.length);
            return;
          case 80: // p = select Previous line
            select_line(selected_line <= 0 ? lines.length - 1 : selected_line - 1);
            return;
          case 68: // d = Delete selected line
            if (selected_line < 0) return;
            console.log(lines.length);
            var deleted = lines.splice(selected_line, 1);
            console.log(lines.length);
            selected_line = -1;
            drawLines();
            console.log("deleted selected line: " + JSON.stringify(deleted));
            return;
          case 85: // u = Unselect selected line
            unselect_selected_line();
            return;
          case 71: // g = Grow selected line
            if (selected_line < 0) return;
            var line = lines[selected_line];
            if (line.x1 === line.x2) // vertical line
              if (line.y2 >= line.y1) line.y2++; else line.y1++;
            if (line.y1 === line.y2) // horizontal line
              if (line.x2 >= line.x1) line.x2++; else line.x1++;
            updateLines();
            console.log("grew line: " + JSON.stringify(line));
            return;
          case 83: // s = Shrink selected line
            if (selected_line < 0) return;
            var line = lines[selected_line];
            if (line.x1 === line.x2) // vertical line
              if (line.y2 >= line.y1) line.y2--; else line.y1--;
            if (line.y1 === line.y2) // horizontal line
              if (line.x2 >= line.x1) line.x2--; else line.x1--;
            updateLines();
            console.log("shrunk line: " + JSON.stringify(line));
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
            console.log("rotated line: " + JSON.stringify(line));
            return;
          case 65: // a = Add a new line to the board
            lines.push({"x1":88,"y1":144,"x2":130,"y2":144,"selected":true});
            if (selected_line > -1) lines[selected_line].selected = false;
            selected_line = lines.length - 1;
            drawLines();
            return;
          case 76: // l = log all Lines to the console
            var toLog = lines.map(function(line){
              return {x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2};
            });
            console.log(JSON.stringify(toLog));
            return;
          case LEFT:
            move = true;
            if (moveLine({x1: -1, y1: 0, x2: -1, y2: 0}, selected_line)) return;
            break;
          case RIGHT:
            move = true;
            if (moveLine({x1: 1, y1: 0, x2: 1, y2: 0}, selected_line)) return;
            break;
          case UP:
            move = true;
            if (moveLine({x1: 0, y1: -1, x2: 0, y2: -1}, selected_line)) return;
            break;
          case DOWN:
            move = true;
            if (moveLine({x1: 0, y1: 1, x2: 0, y2: 1}, selected_line)) return;
            break;
        }

        if (!move) return;

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
    console.log("eating pill");
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

  function drawLines()
  {
    // call this function when data is added or removed

    var borders = svg.selectAll("line")
      .data(lines);

    borders.exit().remove();
    borders.enter().append("line");

    updateLines();
  }

  function updateLines()
  {
    // call this function when the existing data changes

    var lineAttribs = svg.selectAll("line")
      .attr("x1", function (d) { return d.x1; })
      .attr("y1", function (d) { return d.y1; })
      .attr("x2", function (d) { return d.x2; })
      .attr("y2", function (d) { return d.y2; })
      .attr("stroke-width", 1)
      .attr("stroke", function (d) {return d.selected ? "red" : "#2121de"; });
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
    var radius = pacman.radius + pacman.margin;

    if (collision_lines_circle(lines, {radius: radius, x: coords.x, y: coords.y})){
      coords = getNewCoords(pacman.direction);
      angle = pacman.rotateAngle;
      direction = pacman.direction;

      if (collision_lines_circle(lines, {radius: radius, x: coords.x, y: coords.y})){

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
  bindMouseMoveEvent();
}

ready(init);
