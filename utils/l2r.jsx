// sync right content with left content while keeping layer structure
// WARNING: This script does not support vector and layer mask.
// NOTE: If name of layer or layer set starting with #, its operation will be skipped.

var doc = app.activeDocument;
doc.suspendHistory('Sync left content to right', 'exec()');

function map(list, mapper) {
  var mapped = [];
  for (var c = 0; c < list.length; c++)
    mapped.push(mapper(list[c]));
  return mapped;
}
function unitToNr(val) {
  return parseFloat(/^[.0-9]+/.exec(val));
}
function resetArtLayer(l) {
  var props = [ ['blendMode', BlendMode.NORMAL],
            ['fillOpacity', 100], 
            ['pixelsLocked', false],
            ['transparentPixelsLocked', false],
            ['visible', true] ];
  var state = {};
  state.applyTo = function(l) {
    s = this;
    map(props, function(p) {
      if (l[p[0]] != s[p[0]])
        l[p[0]] = s[p[0]];
    });
  };
  map(props, function(p) {
    state[p[0]] = l[p[0]];
    l[p[0]] = p[1];
  });
  return state;
}
function boundsToRect(lb) {
  // NOTE: bounds is LTRB format: [x1, y1, x2, y2]
  var b = map(lb, unitToNr);
  return { x: b[0], y: b[1], w: b[2] - b[0], h: b[3] - b[1],
    empty: function() { return this.w == this.h && this.h == 0; } }; 
}
function l2r(l) {
  var state = resetArtLayer(l);
  var c = unitToNr(doc.width) / 2;
  var h = unitToNr(doc.height);
  var w = unitToNr(doc.width);
  var leftRegion = [[0, 0], [c, 0], [c, h], [0, h], [0, 0]];
  var rightRegion = [[c, 0], [w, 0], [w, h], [c, h], [c, 0]];
  doc.activeLayer = l;
  doc.selection.select(rightRegion);
  doc.selection.clear();
  doc.selection.deselect();
  var lb = boundsToRect(l.bounds);
  if (lb.empty())
    return l;
  var right = l.duplicate(l, ElementPlacement.PLACEBEFORE);
  right.resize(-100, 100, AnchorPosition.MIDDLECENTER);
  expect = w - (lb.x + lb.w);
  right.translate(expect - lb.x, 0);
  merged = right.merge(); 
  state.applyTo(merged);
  return merged;
}
function handleLayers(layers) {
  map(layers, function(l) {
    if (!this.groups)
      this.groups = []
    if (/^#/.test(l.name)) return;
    switch (l.typename) {
      case 'ArtLayer':
        if (l.grouped) {
          l.grouped = false;
          this.groups.splice(0, 0, l);
          return;
        }
        l2r(l);
        break;
      case 'LayerSet':
        var visible = l.visible;
        l.visible = true;
        handleLayers(l.layers);
        l.visible = visible; 
        break;
      default:
        return;
    }
    map(this.groups, function(g) {
      l2r(g);
      g.grouped = true;
    });
    this.groups = [];
  });
}
function exec() {
  handleLayers([doc.activeLayer]);
}
