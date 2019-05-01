#include 'lib.jsx'

var plsname = /^#\s*palette$/;
var doc = app.activeDocument;
var al = doc.activeLayer;
var affected = 0;
var notfound = {};
doc.suspendHistory('Fill sync (All)', 'exec()');

function findPaletteLayerSet(criteria) {
  if (!criteria.parent) return;
  var ls = criteria.parent.layerSets;
  if (!ls) return;
  for (var c = 0; c < ls.length; c++) {
    if (plsname.test(ls[c].name))
      return ls[c];
  }
  return findPaletteLayerSet(criteria.parent); 
}
function queryLinkID(l) {
  var m = /#(.+)$/.exec(l.name);
  if (!m) return;
  m = /fill\(([^)]+)\)/.exec(m[1]);
  if (!m) return; 
  return m[1];
}
function makePalette(pls) {
  var pal = {};
  doc.colorSamplers.removeAll(); // NOTE: sampler is up to 10
  var ls = pls.layerSets;
  for (var c = 0; c < ls.length; c++) {
    var s = ls[c];
    var sls = s.artLayers;
    for (var d = 0; d < sls.length; d++) {
      var l = sls[d];
      var lid = queryLinkID(l);
      if (!lid) continue; 
      if (pal[lid]) throw lid + ' is duplicated';
      var x = (l.bounds[2] - l.bounds[0]) / 2 + l.bounds[0];
      var y = (l.bounds[3] - l.bounds[1]) / 2 + l.bounds[1];
      var sample = doc.colorSamplers.add([x, y]);
      pal[lid] = sample.color;
      sample.remove();
    }
  }
  return pal;
}
function handleLayers(layers, pal) {
  for (var c = 0; c < layers.length; c++) {
    var l = layers[c];
    if (l.typename == 'ArtLayer') {
      var id = queryLinkID(l);
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
  var pls = findPaletteLayerSet(al);
  if (!pls) {
    alert('#palette is not found');
  }
  var pal = makePalette(pls);
  handleLayers(pls.parent.layers, pal);

  alert(affected + ' layers had been filled');
  var warn = [];
  for (var p in notfound)
    warn.push([p, '(', notfound[p], ')'].join(''));
  if (warn.length > 0 )
    alert('WARNING: following colors are not defined in #palette: ' + warn.join(', '));
}
