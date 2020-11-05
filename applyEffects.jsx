// applyEffects.jsx
#include 'lib.jsx'

var doc = app.activeDocument;
var al = doc.activeLayer;
var effectLayers = [];

doc.suspendHistory('Apply Effects', 'exec()');

function freezeArray(arr) {
  var fa = [];
  for (var c = 0; c < arr.length; c++)
    fa.push(arr[c]); 
  return fa;
}
function handleLayer(l) {
  for (var c = 0; c < effectLayers.length; c++) {
    var E = effectLayers[c];
    if (!E.visible) continue;
    var D = E.duplicate(l, ElementPlacement.PLACEBEFORE);
    D.grouped = true;
    D.merge();
  } 
}
function handleLayers(L) {
  L = freezeArray(L);
  for (var c = 0; c < L.length; c++) {
    if (L[c].typename === 'LayerSet')
      handleLayers(L[c].layers)
    else if (L[c].typename == 'ArtLayer')
      handleLayer(L[c]);
  }
}
function exec() {
  var L = freezeArray(doc.layers);
  if (L[0].typename != 'LayerSet' || L[0].name != 'effects') {
    alert('最初のフォルダはeffectsである必要があります');
    return;
  }
  effectLayers = freezeArray(L[0].artLayers);
  L.splice(0, 1);
  handleLayers(L);
  for (var c = 0; c < effectLayers.length; c++) {
    effectLayers[c].visible = false;
  }
}
