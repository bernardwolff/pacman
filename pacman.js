function init() {
  var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, SPACE = 32;
  var keys = {};
  keys[LEFT] = -90;
  keys[UP] = 0;
  keys[RIGHT] = 90;
  keys[DOWN] = 180;

  var MOVE_AMOUNT = 1, PILL_SIZE = 3;

  var num_pills = Math.floor(d3.randomUniform(50, 500)());

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
      },
      pills = Array.apply(0, Array(num_pills)).map(function (pill){
        return {
          x: d3.randomUniform(pacman.radius, screen.width - pacman.radius)(),
          y: d3.randomUniform(pacman.radius, screen.height - pacman.radius)()
        };
      });

  var svg = d3.select("body")
    .append("svg")
    .attr("width", screen.width)
    .attr("height", screen.height)
    .style("background-color", screen.bgColor);

  var rects = svg.selectAll("rect")
    .data(pills)
    .enter()
    .append("rect");

  var pillStyle = function (d) { return d.eaten ? "black" : "peachpuff"; };
  var rectAttribs = rects
    .attr("x", function (d) { return d.x; })
    .attr("y", function (d) { return d.y; })
    .attr("width", PILL_SIZE)
    .attr("height", PILL_SIZE)
    .style("fill", pillStyle);

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

  function openOrCloseMouth() {
    pacman.mouthOpen = !pacman.mouthOpen;
    path.attr("d", arc(pacman));
  }

  var eat = null, move = null;
  function startMoving() {
    if (eat === null) eat = d3.interval(openOrCloseMouth, 80);
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
    path.attr("d", arc(pacman));
  }
  startMoving();

  function movePacman() {
    var newx, newy;
    switch (pacman.direction) {
      case LEFT:
        newx = pacman.x - MOVE_AMOUNT;
        if (newx - pacman.radius <= 0) stopMoving()
        else pacman.x = newx;
        break;
      case UP:
        newy = pacman.y - MOVE_AMOUNT;
        if (newy - pacman.radius <= 0) stopMoving();
        else pacman.y = newy;
        break;
      case RIGHT:
        newx = pacman.x + MOVE_AMOUNT;
        if (newx + pacman.radius >= screen.width) stopMoving();
        else pacman.x = newx;
        break;
      case DOWN:
        newy = pacman.y + MOVE_AMOUNT;
        if (newy + pacman.radius >= screen.height) stopMoving();
        else pacman.y = newy;
        break;
    }
    g.attr("transform", pacman.translate());
  }

  function eatPills() {
    pills.forEach(function(pill) {
      if (pill.eaten) return;
      switch (pacman.direction) {
        case LEFT:
          if (pill.x >= pacman.x && pill.x <= pacman.x + pacman.radius &&
              pill.y >= pacman.y - pacman.radius && pill.y <= pacman.y + pacman.radius) {
            eatPill(pill);
          }
          break;
        case UP:
          if (pill.x >= pacman.x - pacman.radius && pill.x <= pacman.x + pacman.radius &&
              pill.y >= pacman.y && pill.y <= pacman.y + pacman.radius) {
            pill.eaten = true;
            eatPill(pill);
          }
          break;
        case RIGHT:
          if (pill.x <= pacman.x && pill.x >= pacman.x - pacman.radius &&
              pill.y >= pacman.y - pacman.radius && pill.y <= pacman.y + pacman.radius) {
            pill.eaten = true;
            eatPill(pill);
          }
          break;
        case DOWN:
          if (pill.x >= pacman.x - pacman.radius && pill.x <= pacman.x + pacman.radius &&
              pill.y <= pacman.y && pill.y >= pacman.y - pacman.radius) {
            pill.eaten = true;
            eatPill(pill);
          }
          break;
      }
    });
  }

  d3.select("body")
    .on("keydown", function() {
      if (d3.event.keyCode === SPACE) {
        stopMoving();
        return;
      }
      pacman.rotateAngle = keys[d3.event.keyCode];
      pacman.direction = d3.event.keyCode;
      g.attr("transform", pacman.translate());
      startMoving();
    });
}

ready(init);
