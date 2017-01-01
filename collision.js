function collision (line, circle)
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
