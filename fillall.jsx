#include 'lib.jsx'

var doc = app.activeDocument;
var al = doc.activeLayer;
var affected = 0;
var notfound = {};
doc.suspendHistory('Fill sync (All)', 'exec()');

function handleLayers(layers, pal) {
  for (var c = 0; c < layers.length; c++) {
    var l = layers[c];
    if (l.typename == 'ArtLayer') {
      var instr = parseInstructions(l.name);
      if (!instr || !instr['fill']) return;
      var id = instr['fill'];
      if (!id) continue;
      var color = pal[id];
      if (!color) {
        if (notfound[id]) notfound[id] ++;
        else notfound[id] = 1;
        continue;
      }
      doc.activeLayer = l;
      doc.activeLayer.pixelsLocked = false;
      doc.activeLayer.transparentPixelsLocked = false;
      doc.selection.deselect();
      doc.selection.fill(color, ColorBlendMode.NORMAL, 100, true);
      affected++;
    }
    else if (l.typename == 'LayerSet') {
      if (plsname.test(l.name)) continue;
      handleLayers(l.layers, pal);
    }
  }
}
function exec() {
  var pal;
  try {
    pal = parsePaletteLayerSet(pls);
  }
  catch(e) {
    alert(e);
    return;
  }
  handleLayers(pls.parent.layers, pal);
  alert(affected + ' layers had been filled');
  var warn = [];
  for (var p in notfound)
    warn.push([p, '(', notfound[p], ')'].join(''));
  if (warn.length > 0 )
    alert('WARNING: following colors are not defined in #palette: ' + warn.join(', '));
}
