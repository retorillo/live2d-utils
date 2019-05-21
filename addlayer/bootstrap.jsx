#include '../lib.jsx'
var undefined = ({}).polyfill; 
var doc;
var TYPE;
var COLOR;
function bootstrap(type, color) {
  TYPE = type;
  COLOR = !color ? '' : color;
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
function parseAddLayerInstruction(name){
  var instr = parseInstructions(name);
  if (!instr || !instr['addlayer']) return null;
  var parsed = {};
  var params = instr['addlayer'];
  for (var c = 0; c < params.length; c++) {
    var m = /([^=]*)=?([^=]*)/.exec(params[c]);
    if (m[2])
      parsed[m[1]] = m[2];
  }
  return parsed;
}
function fetchAddLayerInstruction(l) {
  var I = {};
  var L = l;
  do {
    var i = parseAddLayerInstruction(L.name);
    if (!i) continue;
    if (i.base !== undefined && I.base === undefined)
      I.base = i.base;
    if (i.grouped !== undefined && I.grouped === undefined)
      I.grouped = i.grouped == "true" ? true : false;
  } while (L = L.parent);
  if (I.grouped === undefined) I.grouped = true;
  return I;
}
function fetchFillID(name) {
  var instr = parseInstructions(name);
  if (!instr || !instr['fill']) return null;
  return instr['fill'][0];
}
function exec() {
  var al = doc.activeLayer;
  var instr = fetchAddLayerInstruction(al);
  var id;
  var place;

  if (instr.grouped) {
    var gr = findGroupedRoot(al);
    id = fetchFillID(gr.root.name);
    place = gr.ref;
  }
  else {
    id = null;
    place = al; 
  }
  
  if (!id) {
    if (!instr.base) {
      alert('#fill or #addlayer instruction not found');
      return;
    }
    id = instr.base;
  }

  var l = al.parent.artLayers.add();
  var nid;
  
  if (id.length > COLOR.length && id.substr(id.length - COLOR.length) == COLOR)
    nid = id;
  else
    nid = [id, COLOR].join('-');

  l.name = TYPE + ' #fill(' + nid + ')';
  l.move(place, ElementPlacement.PLACEBEFORE);
  if (instr.grouped && !l.grouped) l.grouped = true;
  doc.activeLayer = l;
  try {
    var criteria = instr.base ? instr.base : id.split('-')[0];
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
