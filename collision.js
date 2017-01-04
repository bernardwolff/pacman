function collision_line_circle (line, circle)
{
  function dot(p1, p2)
  {
    return p1.x * p2.x + p1.y * p2.y;
  }

  var d = {x: line.x2 - line.x1, y: line.y2 - line.y1};
  var f = {x: line.x1 - circle.x, y: line.y1 - circle.y};
  var a = dot(d, d);
  var b = 2 * dot(f, d);
  var c = dot(f, f) - circle.radius * circle.radius;

  var discriminant = b * b - 4 * a * c;
  if (discriminant < 0)
  {
    return false;
  }

  discriminant = Math.sqrt(discriminant);

  var t1 = (-b - discriminant) / (2 * a);
  var t2 = (-b + discriminant) / (2 * a);

  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)
}

function collision_line_rect (line, rect)
{
  var collision =
    // first endpoint inside rect
    collision_point_rect({x: line.x1, y: line.y1}, rect) ||
    // second endpoint inside rect
    collision_point_rect({x: line.x2, y: line.y2}, rect) ||
     // horizontal line overlap
    (line.y1 === line.y2 && line.x1 <= rect.x1 && line.x2 >= rect.x2 && line.y1 >= rect.y1 && line.y1 <= rect.y2) ||
    // vertical line overlap
    (line.x1 === line.x2 && line.y1 <= rect.y1 && line.y2 >= rect.y2 && line.x1 >= rect.x1 && line.x1 <= rect.x2);

    return collision;
}

function collision_point_rect (point, rect)
{
  return point.x >= rect.x1 && point.x <= rect.x2 &&
    point.y >= rect.y1 && point.y <= rect.y2;
}
