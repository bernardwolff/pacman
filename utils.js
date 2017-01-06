/*function collision_line_circle (line, circle)
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
}*/

function collision_line_rect (line, rect)
{
  var rect_min = {x: Math.min(rect.x1, rect.x2), y: Math.min(rect.y1, rect.y2)};
  var rect_max = {x: Math.max(rect.x1, rect.x2), y: Math.max(rect.y1, rect.y2)};
  var sorted_rect = {x1: rect_min.x, y1: rect_min.y, x2: rect_max.x, y2: rect_max.y};

  var sorted_line = {x1: Math.min(line.x1, line.x2), y1: Math.min(line.y1, line.y2),
    x2: Math.max(line.x1, line.x2), y2: Math.max(line.y1, line.y2)};

  var collision =
    // first endpoint inside rect
    collision_point_rect({x: line.x1, y: line.y1}, sorted_rect) ||
    // second endpoint inside rect
    collision_point_rect({x: line.x2, y: line.y2}, sorted_rect) ||
     // horizontal line overlap
    (line.y1 === line.y2 &&
      sorted_line.x1 <= sorted_rect.x1 && // left side of line is outside the rect
      sorted_line.x2 >= sorted_rect.x2 && // right side of line is outside the rect
      sorted_line.y1 >= sorted_rect.y1 && // line is below top of rect
      sorted_line.y1 <= sorted_rect.y2) || // line is above bottom of rect
    // vertical line overlap
    (sorted_line.x1 === sorted_line.x2 &&
      sorted_line.y1 <= sorted_rect.y1 &&
      sorted_line.y2 >= sorted_rect.y2 &&
      sorted_line.x1 >= sorted_rect.x1 &&
      sorted_line.x1 <= sorted_rect.x2);

    return collision;
}

function collision_point_rect (point, rect)
{
  return point.x >= rect.x1 && point.x <= rect.x2 &&
    point.y >= rect.y1 && point.y <= rect.y2;
}

function rotate_point (point, angle)
{
  return {x: point.x * Math.cos(angle) - point.y * Math.sin(angle), y: point.y * Math.cos(angle) + point.x * Math.sin(angle)};
}

function rotate_line (line, angle)
// rotate a line about its center
{
  var center = {x: (line.x1 + line.x2) / 2, y: (line.y1 + line.y2) / 2};
  var normalized = {x1: line.x1 - center.x, y1: line.y1 - center.y, x2: line.x2 - center.x, y2: line.y2 - center.y};
  var angle = Math.PI / 2;
  var p1 = rotate_point({x: normalized.x1, y: normalized.y1}, angle);
  var p2 = rotate_point({x: normalized.x2, y: normalized.y2}, angle);
  var rotated = {x1: p1.x + center.x, y1: p1.y + center.y, x2: p2.x + center.x, y2: p2.y + center.y};
  return rotated;
}
