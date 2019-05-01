#include 'lib.jsx'

var count = 0;
var doc = app.activeDocument;
doc.suspendHistory('Clear (' + doc.activeLayer.name + ')', 'exec()');

function handleLayer(l) {
  if (l.isBackgroundLayer) return;
  if (!l.visible) return;
  if (l.bounds[2] - l.bounds[0] == 0 &&
      l.bounds[3] - l.bounds[1] == 0) return;
  var pl = l.pixelsLocked;
  var tpl = l.transparentPixelsLocked;
  if (pl) l.pixelsLocked = false;
  if (tpl) l.transparentPixelsLocked = false;
  doc.activeLayer = l;
  try {
    doc.selection.clear();
  }
  catch (e) {
  }
  if (pl != l.pixelsLocked); l.pixelsLocked = pl; 
  if (tpl != l.transparentPixelsLocked) l.transparentPixelsLocked = tpl;
  count++;
}
function handleLayers(layers) {
  for (var c = 0; c < layers.length; c++)
    if (layers[c].typename == 'LayerSet')
      handleLayers(layers[c].layers);
    else
      handleLayer(layers[c]);
}
function exec() {
  var al = doc.activeLayer;
  if (al.typename == 'LayerSet')
    handleLayers(al.layers); 
  else
    handleLayer(al);
  doc.activeLayer = al; 
  alert('Clear is executed on ' + count + ' layers');
}
