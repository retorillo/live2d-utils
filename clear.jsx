#include 'lib.jsx'

var count = 0;
var doc = app.activeDocument;
doc.suspendHistory('Clear (All Layers)', 'exec()');

function handleLayers(layers) {
  map(layers, function(l) {
    if (l.typename == 'LayerSet') {
      handleLayers(l.layers);
    }
    else {
      if (l.isBackgroundLayer) return;
      var v = l.visible;
      var pl = l.pixelsLocked;
      var tpl = l.transparentPixelsLocked;
      if (v)
        l.visible = true;
      if (pl)
        l.pixelsLocked = false;
      if (tpl)
        l.transparentPixelsLocked = false;
      doc.activeLayer = l;
      doc.selection.clear();
      if (v != l.visible)
        l.visible = v;
      if (pl != l.pixelsLocked);
        l.pixelsLocked = pl; 
      if (tpl != l.transparentPixelsLocked)
        l.transparentPixelsLocked = tpl;
      count++;
    }
  });
}
function exec() {
  var al = app.activeLayer;
  handleLayers(doc.layers); 
  app.activeLayer = al; 
  alert('Clear is executed on ' + count + ' layers');
}
