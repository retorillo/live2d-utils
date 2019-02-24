// Sync left content to right recursively
// WARNING: This script does not support Vector and Layer masks.
var doc = app.activeDocument;
doc.suspendHistory('Sync left content to right', 'exec()');

function map(list, mapper) {
  mapped = [];
  for (var c = 0; c < list.length; c++)
    mapped.push(mapper(list[c]));
  return mapped;
}
function unitToNr(val) {
  return parseFloat(/^[.0-9]+/.exec(val));
}
function resetLayerState(layer) {
  props = [ ['blendMode', BlendMode.NORMAL],
            ['fillOpacity', 100], 
            ['pixelsLocked', false],
            ['transparentPixelsLocked', false],
            ['visible', true] ];
  state = {};
  state.applyTo = function(l) {
    s = this;
    map(props, function(p) {
      if (l[p[0]] != s[p[0]])
        l[p[0]] = s[p[0]];
    });
  };
  map(props, function(p) {
    state[p[0]] = layer[p[0]];
    layer[p[0]] = p[1];
  });
  return state;
}
function l2r(layer) {
  state = resetLayerState(layer);
  c = unitToNr(doc.width) / 2;
  h = doc.height;
  w = unitToNr(doc.width);
  leftRegion = [[0, 0], [c, 0], [c, h], [0, h], [0, 0]];
  rightRegion = [[c, 0], [w, 0], [w, h], [c, h], [c, 0]];
  doc.activeLayer = layer;
  doc.selection.select(rightRegion);
  doc.selection.clear();
  doc.selection.deselect();
  right = layer.duplicate(layer, ElementPlacement.PLACEBEFORE);
  right.resize(-100, 100, AnchorPosition.MIDDLECENTER);
  bounds = map(layer.bounds, unitToNr);
  // NOTE: bounds is LTRB format: [x1, y1, x2, y2]
  x = bounds[0]
  lw = bounds[2] - bounds[0];
  expected_x = w - (x + lw);
  right.translate(expected_x - x, 0);
  merged = right.merge(); 
  state.applyTo(merged);
  return merged;
}
function handleArtLayers(layers) {
  groups = []
  map(layers, function(l) {
    if (l.grouped) {
      l.grouped = false;
      groups.splice(0, 0, l);
      return;
    }
    placeTarget = l2r(l);
    map(groups, function(g) {
      l2r(g);
      g.grouped = true;
    });
    groups = [];
  });
}
function handleLayerSets(sets) {
  map(sets, function(s) {
    handleArtLayers(s.artLayers);
    handleLayerSets(s.layerSets);
  });
}
function exec() {
  if (doc.activeLayer.typename == 'ArtLayer')
    handleArtLayers([doc.activeLayer]);
  else
    handleLayerSets([doc.activeLayer]);
}
