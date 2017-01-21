function rotate_point (point, angle) {
  return {x: point.x * Math.cos(angle) - point.y * Math.sin(angle), y: point.y * Math.cos(angle) + point.x * Math.sin(angle)};
}

function rotate_line (line, angle) {
// rotate a line about its center
  var center = {x: (line.x1 + line.x2) / 2, y: (line.y1 + line.y2) / 2};
  var normalized = {x1: line.x1 - center.x, y1: line.y1 - center.y, x2: line.x2 - center.x, y2: line.y2 - center.y};
  var angle = Math.PI / 2;
  var p1 = rotate_point({x: normalized.x1, y: normalized.y1}, angle);
  var p2 = rotate_point({x: normalized.x2, y: normalized.y2}, angle);
  var rotated = {x1: p1.x + center.x, y1: p1.y + center.y, x2: p2.x + center.x, y2: p2.y + center.y};
  return rotated;
}
