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
function parseFillInstruction(name){
  var instr = parseInstructions(name);
  if (!instr || !instr['fill']) return null;
  var parsed = {};
  var params = instr['fill'];
  var id;
  for (var c = 0; c < params.length; c++) {
    var m = /([^=]*)=?([^=]*)/.exec(params[c]);
    if (m[2])
      parsed[m[1]] = m[2];
    else if (!id)
      id = params[c];
  }
  return { id: id, base: parsed['base'] };
}
function exec() {
  var al = doc.activeLayer;
  var gr = findGroupedRoot(al);
  var instr = parseFillInstruction(gr.root.name);
  if (!instr || !instr.id) {
    instr = parseFillInstruction(gr.root.parent.name);
    if (!instr || !instr.base) {
      alert('#fill instruction does not found');
      return;
    }
    instr = { id: instr.base, base: instr.base };
  }
  var l = al.parent.artLayers.add();
  var nid;
  
  if (instr.id.length > COLOR.length && instr.id.substr(instr.id.length - COLOR.length) == COLOR)
    nid = instr.id;
  else
    nid = [instr.id, COLOR].join('-');

  l.name = TYPE + ' #fill(' + nid + ')';
  l.move(gr.ref, ElementPlacement.PLACEBEFORE);
  if (!l.grouped) l.grouped = true;
  doc.activeLayer = l;
  try {
    var criteria = instr.base ? instr.base : instr.id.split('-')[0];
    var pal = parsePaletteLayerSet(null, function(l) { return l.name == criteria });
    if (pal[nid])
      app.foregroundColor = pal[nid];
    else
      alert('color "' + nid + '" is not defined');
  }
  catch (e) {
    alert('"' + nid + '" is not found or something wrong: ' + e);
  }
}
