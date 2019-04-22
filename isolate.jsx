#include 'lib.jsx'

var doc = app.activeDocument;
var activeTree = [];
doc.suspendHistory('Isolate Active Layer', 'exec()');

function isActiveTree(l) {
  for (var c = 0; c < activeTree.length; c++) {
    if (l == activeTree[c])
      return true;
  }
  return false;
}
function handleLayers(layers, active){
  map(layers, function(l) {
    if (/^#/.test(l.name))
      return;
    if (active || isActiveTree(l)) {
      if (!l.visible)
        l.visible = true;
      if (l.typename == 'LayerSet')
        handleLayers(l.layers, l == doc.activeLayer);
    }
    else if (l.visible)
      l.visible = false;
  });
}
function exec() {
  var l = doc.activeLayer;
  for (var c = 0; c < 256; c++) {
    activeTree.push(l);
    if (l.parent == doc.activeLayer || l.parent == null)
      break;
    l = l.parent;
  }
  handleLayers(doc.layers, false);
}


