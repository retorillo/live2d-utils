#include 'lib.jsx'

var plsname = /^#\s*palette$/;
var doc = app.activeDocument;
var al = doc.activeLayer;
var affected = 0;
var notfound = [];
doc.suspendHistory('Adjust Levels', 'exec()');

function queryLevelArgs(l) {
  var m = /#(.+)$/.exec(l.name);
  if (!m) return;
  m = /level\(([^)]+)\)/.exec(m[1]);
  if (!m) return; 
  var args = map(m[1].split(/\s*,\s*/g), function(str) {
    var f = parseFloat(str);
    if (f !== f)
      throw str + ' is NaN (#level)';
    return f;
  });
  if (args.length !== 5)
    throw 'invalid number of arguments : level(...)'
  return args;
}
function isEmpty(l) {
  return l.bounds[2] - l.bounds[1] == 0 || l.bounds[3] - l.bounds[1] == 0;
}
function handleLayer(l, level) {
  try {
    if (isEmpty(l)) return;
    l.adjustLevels(level[0], level[2], level[1], level[3], level[4]);
  }
  catch (e) {
  }
  affected++;
}
function handleLayers(layers, level) {
  for (var c = 0; c < layers.length; c++) {
    var l = layers[c];
    if (l.typename == 'ArtLayer')
      handleLayer(l, level);
    else if (l.typename == 'LayerSet') {
      if (plsname.test(l.name)) continue;
      handleLayers(l.layers, level);
    }
  }
}
function exec() {
  var al = doc.activeLayer;
  var level = queryLevelArgs(al);
  if (!level) {
    alert('# level(irs, irg, ire, ors, ore) is not specified');
    return;
  }
  if (al.typename == 'LayerSet')
    handleLayers(al.layers, level);
  else
    handleLayer(al, lavel);
  alert(affected + ' layers had been adjusted');
}
