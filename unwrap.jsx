#include 'lib.jsx'

var doc = app.activeDocument;
var dummy;
var pos;
var counter = 0;
doc.suspendHistory('Unwrap', 'exec()');

function handleLayer(l) {
  if (l.typename == 'ArtLayer') {
    counter++;
    l.move(pos, ElementPlacement.PLACEAFTER);
    pos = l;
  }
  else {
    map(l.layers, handleLayer);
    l.remove();
  }
}
function exec() {
  pos = dummy = doc.artLayers.add();
  dummy.name = 'UNWRAPPER';
  map(doc.layers, handleLayer); 
  dummy.remove();
  alert(counter + ' layers were exposed');
}


