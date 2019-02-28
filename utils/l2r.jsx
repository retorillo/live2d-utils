// sync right content with left content while keeping layer structure
// WARNING: This script does not support vector and layer mask.
// NOTE: If name of layer or layer set starting with #, its operation will be skipped.

#include 'lib.jsx'

var doc = app.activeDocument;
doc.suspendHistory('Sync left content to right', 'exec()');

function l2r(l) {
  var state = resetArtLayer(l);
  var w = unitToNr(doc.width);
  var h = unitToNr(doc.height);
  var c = w / 2;
  var leftRegion = [[0, 0], [c, 0], [c, h], [0, h], [0, 0]];
  var rightRegion = [[c, 0], [w, 0], [w, h], [c, h], [c, 0]];
  doc.activeLayer = l;
  doc.selection.select(rightRegion);
  doc.selection.clear();
  doc.selection.deselect();
  var lb = boundsToRect(l.bounds);
  if (lb.empty()) {
    state.applyTo(l);
    return l;
  }
  var right = l.duplicate(l, ElementPlacement.PLACEBEFORE);
  right.resize(-100, 100, AnchorPosition.MIDDLECENTER);
  var expect = w - (lb.x + lb.w);
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
