#include 'lib.jsx'

var doc = app.activeDocument;
var counter = 0;
doc.suspendHistory('Auto Numbering', 'exec()');

function exec() {
  if (doc.activeLayer.typename != 'LayerSet') {
    alert("Select layer set and reload this script");
  }
  var count = doc.activeLayer.layers.length;
  map(doc.activeLayer.layers, function(l) {
    l.name = (count--).toString();
  });
}


