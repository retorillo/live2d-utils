var doc = app.activeDocument;
var counter = 0;
doc.suspendHistory('Fill sync', 'exec()');

function union(list1, list2) {
  var u = [];
  for (var c = 0; c < Math.max(list1.length, list2.length); c++)
    u.push([list1[c], list2[c]]); 
  return u;
}
function freeze(list) {
  var freezed = [];
  for (var c = 0; c < list.length; c++)
    freezed.push(list[c]);
  return freezed;  
}
function map(list, mapper) {
  var mapped = [];
  var f = freeze(list);
  for (var c = 0; c < f.length; c++)
    mapped.push(mapper(f[c]));
  return mapped;
}
function unitToNr(val) {
  return parseFloat(/^[.0-9]+/.exec(val));
}
function queryLinkID(l){
  var m = /#(.+)$/.exec(l.name);
  if (!m) return;
  m = /fill\(([^)]+)\)/.exec(m[1]);
  if (!m) return; 
  return m[1];
}
function handleLayers(layers, id) {
  map(layers, function(l) {
    var i = queryLinkID(l);
    if (i != id) {
      if (l.typename == 'LayerSet')
        handleLayers(l.layers, id);
      return;
    }
    doc.activeLayer = l;
    l.allLocked = false;
    doc.selection.fill(app.foregroundColor, ColorBlendMode.NORMAL, 100, true);
    counter++;
  });
}
function exec() {
  var active = doc.activeLayer;
  var id = queryLinkID(active);
  var w = unitToNr(doc.width);
  var h = unitToNr(doc.height);
  doc.selection.select([[0, 0], [w, 0], [w, h], [0, h], [0, 0]]);
  if (!id) {
    alert('Fill ID does not found: fill(ID)');
    return;
  }
  handleLayers(doc.layers, id);
  doc.selection.deselect();
  alert(counter + ' layers were filled');
}
