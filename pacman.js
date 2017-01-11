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
    num_pills = pills.length,
    selected_line = -1,
    selected_pill = -1,
    transitionDuration = 2000;

/*for (var i = 36; i < screen.height; i+=8) {
  for (var j = 12; j < screen.width; j+=8) {
    pills.push({x: j, y: i});
  }
}
num_pills = pills.length*/

var svg, arc, g, path;

function initSvg() {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  var scaleAmount = x < y ? Math.floor(x / screen.width) : Math.floor(y / screen.height);
  svg = d3.select("body")
    .append("svg")
    .attr("width", screen.width)
    .attr("height", screen.height)
    .style("background-color", screen.bgColor)
    .style("transform", "scale(" + scaleAmount + ")");
}

function tryClick(objects, collision_func, select_func, buffer) {
  var index = -1;
  // add 1 extra pixel around mouse to make it easier to select the line
  var rect = {x1: d3.event.offsetX - buffer, y1: d3.event.offsetY - buffer,
    x2: d3.event.offsetX + 1, y2: d3.event.offsetY + 1};

  var object = objects.find(function(object) {
    index++;
    return collision_func(object, rect);
  });

  if (object) {
    select_func(index);
  }

  return object;
}

function bindMouseClickEvent() {
  var w = d3.select("svg")
    .on("click", function(){
      console.log("clicked at " + d3.event.offsetX + ", " + d3.event.offsetY);
      unselect_selected_line();
      unselect_selected_pill();
      if (tryClickPill()) return;
      tryClickLine();
    });
}

var lastTouch = null, MIN_TOUCH_AMT = 5;
function bindTouchEvent() {
  d3.select("svg").on("touchmove", function() {
    d3.event.preventDefault();
    d3.event.stopPropagation();
    var d = d3.touches(this);
    if (lastTouch === null) {
      lastTouch = d;
      return;
    }
    var dx = d[0][0] - lastTouch[0][0];
    var dy = d[0][1] - lastTouch[0][1];
    lastTouch = d;
    var key = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > MIN_TOUCH_AMT) {
      if (dx > 0) key = RIGHT;
      else key = LEFT;
    } else if (Math.abs(dy) > MIN_TOUCH_AMT) {
      if (dy > 0) key = DOWN;
      else key = UP;
    }
		if (key) handleKeyDownEvent(key);
  });
}

function handleKeyDownEvent(keyCode) {
      console.log("key pressed " + keyCode);
      var move = false;
      switch (keyCode){
        case SPACE:
          stopMoving();
          return;
        case 70: // f = move to next Frame of animation
          movePacman();
          eatPills();
          return;
        case 78: // n = select Next line/pill
          if (selected_line > -1) select_line((selected_line + 1) % lines.length);
          else if (selected_pill > -1) select_pill((selected_pill + 1) % pills.length);
          return;
        case 80: // p = select Previous line/pill
          if (selected_line > -1) select_line(selected_line <= 0 ? lines.length - 1 : selected_line - 1);
          else if (selected_pill > -1) select_pill(selected_pill <= 0 ? pills.length - 1 : selected_pill - 1);
          return;
        case 68: // d = Delete selected line/pill
          if (selected_line > -1) {
            var deleted = lines.splice(selected_line, 1);
            selected_line = -1;
            drawLines();
            console.log("deleted selected line: " + JSON.stringify(deleted));
          } else if (selected_pill > -1) {
            var deleted = pills.splice(selected_pill, 1);
            selected_pill = -1;
            drawPills();
            console.log("deleted selected pill: " + JSON.stringify(deleted));
          }
          return;
        case 85: // u = Unselect selected line/pill
          if (selected_line > -1) unselect_selected_line();
          else if (selected_pill > -1) unselect_selected_pill();
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
          if (selected_pill > -1) {
            pills[selected_pill].selected = false;
            selected_pill = -1;
            drawPills();
          }
          if (selected_line > -1) lines[selected_line].selected = false;
          selected_line = lines.length - 1;
          drawLines();
          return;
        case 73: // i = add a new pIll to the board
          pills.push({"x":88, "y":144, "selected":true});
          if (selected_line > -1) {
            lines[selected_line].selected = false;
            selected_line = -1;
            drawLines();
          }
          if (selected_pill > -1) pills[selected_pill].selected = false;
          selected_pill = pills.length - 1;
          drawPills();
          return;
        case 76: // l = log all Lines to the console
          var toLog = lines.map(function(line){
            return {x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2};
          });
          console.log(JSON.stringify(toLog));
          return;
        case LEFT:
          move = true;
          if (movePill({x: -1, y: 0}, selected_pill)) return;
          if (moveLine({x1: -1, y1: 0, x2: -1, y2: 0}, selected_line)) return;
          break;
        case RIGHT:
          move = true;
          if (movePill({x: 1, y: 0}, selected_pill)) return;
          if (moveLine({x1: 1, y1: 0, x2: 1, y2: 0}, selected_line)) return;
          break;
        case UP:
          move = true;
          if (movePill({x: 0, y: -1}, selected_pill)) return;
          if (moveLine({x1: 0, y1: -1, x2: 0, y2: -1}, selected_line)) return;
          break;
        case DOWN:
          move = true;
          if (movePill({x: 0, y: 1}, selected_pill)) return;
          if (moveLine({x1: 0, y1: 1, x2: 0, y2: 1}, selected_line)) return;
          break;
      }

      if (!move) return;

      var desiredRotateAngle = keys[keyCode];
      if (desiredRotateAngle === undefined) return;
      pacman.desiredRotateAngle = desiredRotateAngle;
      pacman.desiredDirection = keyCode;
      positionPacman();
      startMoving();
}

function bindKeyDownEvent() {
  d3.select("body")
    .on("keydown", function() {
      handleKeyDownEvent(d3.event.keyCode);
    });
}

function unselect_selected_pill() {
  if (selected_pill < 0) return;
  pills[selected_pill].selected = false;
  selected_pill = -1;
  updatePills();
}

function select_pill(index) {
  if (selected_pill > -1) pills[selected_pill].selected = false;
  selected_pill = index;
  var pill = pills[selected_pill];
  pill.selected = true;
  console.log("selected pill: " + JSON.stringify(pill));
  updatePills();
}

function drawPills(){
  var rects = svg.selectAll("rect")
    .data(pills);

  rects.exit().remove();
  rects.enter().append("rect");

  updatePills();
}

function updatePills () {
  svg.selectAll("rect")
    .attr("x", function (d) { return d.x - PILL_SIZE / 2; })
    .attr("y", function (d) { return d.y - PILL_SIZE / 2; })
    .attr("width", PILL_SIZE)
    .attr("height", PILL_SIZE)
    .style("fill", function (d) { return d.selected ? "red" : "peachpuff"; });
}

function movePill(dp, pill_index) {
  if (pill_index < 0) return false;
  var pill = pills[pill_index];
  pill.x += dp.x;
  pill.y += dp.y;
  updatePills();
  console.log("moved pill to " + JSON.stringify(pill))
  return true;
}

function eatPill (index) {
  console.log("eating pill");

  pills.splice(index, 1);
  num_pills--;
  drawPills();

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

function eatPills() {
  var i = -1;
  var pacman_rect = {
    x1: pacman.x - pacman.radius + pacman.margin,
    x2: pacman.x + pacman.radius - pacman.margin,
    y1: pacman.y - pacman.radius + pacman.margin,
    y2: pacman.y + pacman.radius - pacman.margin
  };
  pills.forEach(function(pill) {
    i++;
    // here we are using margin to do collision detection with a smaller rect
    if (collision_point_rect(pill, pacman_rect)) {
      eatPill(i);
    }
  });
}

function tryClickPill() {
  return tryClick(pills, collision_point_rect, select_pill, 2);
}

function drawLines(transition) {
  // call this function when data is added or removed

  var borders = svg.selectAll("line")
    .data(lines);

  borders.exit().remove();
  borders.enter().append("line");

  updateLines(transition);
}

function updateLines(transition) {
  // call this function when the existing data changes

  var lineAttribs = (transition ? svg.selectAll("line").transition().duration(transition) : svg.selectAll("line"))
    .attr("x1", function (d) { return d.x1; })
    .attr("y1", function (d) { return d.y1; })
    .attr("x2", function (d) { return d.x2; })
    .attr("y2", function (d) { return d.y2; })
    .attr("stroke-width", 1)
    .attr("stroke", function (d) {return d.selected ? "red" : "#2121de"; });
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

function tryClickLine() {
  return tryClick(lines, collision_line_rect, select_line, 1);
}

function moveLineRandomly(line, transformType) {
  switch (transformType) {
    case 0:
      var offset = 10;
      line.x1 = d3.randomUniform(line.x1 - offset, line.x1 + offset)();
      line.y1 = d3.randomUniform(line.y1 - offset, line.y1 + offset)();
      line.x2 = d3.randomUniform(line.x2 - offset, line.x2 + offset)();
      line.y2 = d3.randomUniform(line.y2 - offset, line.y2 + offset)();
      break;
    case 1:
      var direction = d3.randomUniform(-1, 1)();
      // random integer between 0 and 1 (inclusive)
      var axis = Math.random() * 2 | 0;
      if (axis === 0) {
        line.x1 = line.x1 + screen.width * direction;
        line.x2 = line.x2 + screen.width * direction;
      } else {
        line.y1 = line.y1 + screen.width * direction;
        line.y2 = line.y2 + screen.width * direction;
      }
  }
}

function initLines() {
  // random integer between 0 and 1 (inclusive)
  var transformType = Math.random() * 2 | 0;
  console.log("transformType " + transformType);

  lines.forEach(function(line){
    // save original coordinates
    line.ox1 = line.x1;
    line.oy1 = line.y1;
    line.ox2 = line.x2;
    line.oy2 = line.y2;

    moveLineRandomly(line, transformType);
  });

  drawLines(0);

  lines.forEach(function(line){
    // set coordinates back to originals
    line.x1 = line.ox1;
    line.y1 = line.oy1;
    line.x2 = line.ox2;
    line.y2 = line.oy2;

    delete line.ox1;
    delete line.oy1;
    delete line.ox2;
    delete line.oy2;
  });

  drawLines(transitionDuration);
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

ready(function() {
  initSvg();
  initLines();

  d3.timeout(function() {
    drawPills();
    drawPacman();
    positionPacman();
    startMoving();
    bindKeyDownEvent();
    bindMouseClickEvent();
    bindTouchEvent();
  }, transitionDuration * .9);
});
