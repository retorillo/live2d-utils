#include '../lib.jsx'
var doc;
var TYPE;
var COLOR;
function bootstrap(type, color) {
  TYPE = type;
  COLOR = color;
  doc = app.activeDocument;
  doc.suspendHistory('Create Layer (' + [TYPE, COLOR].join(', ') + ')', 'exec()');
}
function findGroupedRoot(l) {
  var p = l.parent;
  var i = -1;
  var I = 0;
  for (; I < p.layers.length; I++) {
    var L = p.layers[I];
    if (i === -1) {
      if (L !== l) continue;
      i = I;
    }
    if (L.typename === 'ArtLayer' && L.grouped)
      continue;
    return { root: L, rootIndex: I, ref: l, refIndex: i };
  }
}
function queryFillID(l){
  var m = /#(.+)$/.exec(l.name);
  if (!m) return;
  m = /fill\(([^)]+)\)/.exec(m[1]);
  if (!m) return; 
  return m[1];
}
function exec() {
  var al = doc.activeLayer;
  var gr = findGroupedRoot(al);
  alert(gr.root.name);
  var id = queryFillID(gr.root);
  if (!id) {
    alert('fill ID not found');
    return;
  }
  var l = al.parent.artLayers.add();
  l.name = TYPE + ' #fill(' + (COLOR ? [id, COLOR].join('-') : id) + ')';
  l.move(gr.ref, ElementPlacement.PLACEBEFORE);
  if (!l.grouped) l.grouped = true;
  doc.activeLayer = l;
}
