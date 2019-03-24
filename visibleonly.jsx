#include 'lib.jsx'

var doc = app.activeDocument;
var counter = 0;
doc.suspendHistory('Remove invisible layers', 'exec()');

function handleLayer(l) {
  if (!l.visible) {
    counter++;
    l.remove();
  }
  else if (l.typename == 'LayerSet')
    map(l.layers, handleLayer);
}
function exec() {
  map(doc.layers, handleLayer); 
  alert(counter + ' invisible layers were removed');
}


