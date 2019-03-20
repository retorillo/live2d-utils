#include 'lib.jsx'

var doc = app.activeDocument;
doc.suspendHistory('Fast deployment for pre-painting', 'exec()');

function handleLayer(l) {
  if (l.typename == 'ArtLayer') {
    doc.activeLayer = l;
    setLayerColor(l, LayerColor.RED);
    set = selectionToLayerSet();
    set.name = l.name;
    l.name = l.name + '-line';
  }
  else map(l.layers, handleLayer);
}
function exec() {
  var set = selectionToLayerSet();
  set.name = 'fast-deploy';
  map(set.layers, handleLayer);
}
