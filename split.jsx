#include 'lib.jsx'
var doc = app.activeDocument;
doc.suspendHistory('Split Layers', 'exec()');
function handleLayer(l) {
  splitLayerToLR(l);
}
function handleLayers(ls) {
  map(ls, function(l) {
    if (l.typename === 'LayerSet')
      handleLayers(l.layers);
    else
      handleLayer(l);
  });
}
function exec() {
  var al = doc.activeLayer;
  if (al.typename === 'LayerSet')
    handleLayers(al.layers);
  else
    handleLayer(al);
}
