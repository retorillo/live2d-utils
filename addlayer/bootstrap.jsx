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
  var id = queryFillID(gr.root);
  if (!id) {
    alert('fill ID not found');
    return;
  }
  var l = al.parent.artLayers.add();
  var nid = COLOR ? [id, COLOR].join('-') : id;
  l.name = TYPE + ' #fill(' + nid + ')';
  l.move(gr.ref, ElementPlacement.PLACEBEFORE);
  if (!l.grouped) l.grouped = true;
  doc.activeLayer = l;
  try {
    var criteria = id.split('-')[0];
    var pal = parsePaletteLayerSet(undefined, function(l) { l.name == criteria });
    if (pal[nid])
      app.foregroundColor = pal[nid];
    else
      alert('color "' + nid + '" is not defined');
  }
  catch (e) {
    alert('"' + nid + '" is not found or something wrong: ' + e);
  }
}
