#include 'lib.jsx'

var plsname = /^#\s*palette$/;
var doc = app.activeDocument;
var al = doc.activeLayer;
var affected = 0;
var notfound = [];
doc.suspendHistory('Adjust Exposure', 'exec()');

function queryExposureArgs(l) {
  var m = /#(.+)$/.exec(l.name);
  if (!m) return;
  m = /exposure\(([^)]+)\)/.exec(m[1]);
  if (!m) return; 
  var args = map(m[1].split(/\s*,\s*/g), function(str) {
    var f = parseFloat(str);
    if (f !== f)
      throw str + ' is NaN (#exposure)';
    return f;
  });
  if (args.length !== 3)
    throw 'invalid number of arguments : exposure(...)'
  return args;
}
function adjustExposure(exposure, offset, gamma) {
  var idExps = charIDToTypeID( "Exps" );
  var desc = new ActionDescriptor();
  var idpresetKind = stringIDToTypeID( "presetKind" );
  var idpresetKindType = stringIDToTypeID( "presetKindType" );
  var idpresetKindCustom = stringIDToTypeID( "presetKindCustom" );
  desc.putEnumerated( idpresetKind, idpresetKindType, idpresetKindCustom );
  var idExps = charIDToTypeID( "Exps" );
  desc.putDouble( idExps, exposure );
  var idOfst = charIDToTypeID( "Ofst" );
  desc.putDouble( idOfst, offset );
  var idgammaCorrection = stringIDToTypeID( "gammaCorrection" );
  desc.putDouble( idgammaCorrection, gamma );
  executeAction( idExps, desc, DialogModes.NO );
}
function isEmpty(l) {
  return l.bounds[2] - l.bounds[1] == 0 || l.bounds[3] - l.bounds[1] == 0;
}
function handleLayer(l, exps) {
  try {
    if (isEmpty(l)) return;
    doc.activeLayer = l;
    doc.selection.deselect();
    adjustExposure(exps[0], exps[1], exps[2]);
  }
  catch (e) {
  }
  affected++;
}
function handleLayers(layers, exps) {
  for (var c = 0; c < layers.length; c++) {
    var l = layers[c];
    if (l.typename == 'ArtLayer')
      handleLayer(l, exps);
    else if (l.typename == 'LayerSet') {
      if (plsname.test(l.name)) continue;
      handleLayers(l.layers, exps);
    }
  }
}
function exec() {
  var al = doc.activeLayer;
  var exps = queryExposureArgs(al);
  if (!exps) {
    alert('# exps(e, o, g) is not specified');
    return;
  }
  if (al.typename == 'LayerSet')
    handleLayers(al.layers, exps);
  else
    handleLayer(al, lavel);
  alert(affected + ' layers had been adjusted');
}
