#include 'lib.jsx'

var doc = app.activeDocument;
var activeTree = [];
doc.suspendHistory('Unisolate', 'exec()');

function handleLayers(layers) {
  map(layers, function(l) {
    if (/^#/.test(l.name))
      return;
    if (!l.visible)
      l.visible = true;
    if (l.typename == 'LayerSet')
      handleLayers(l.layers);
  });
}
function exec() {
  handleLayers(doc.layers);
}


