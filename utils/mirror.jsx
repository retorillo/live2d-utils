#include 'lib.jsx'

var doc = app.activeDocument;
doc.suspendHistory('Mirror linking', 'exec()');

function flipLayer(l, nameref){
  var w = unitToNr(doc.width);
  var lb = boundsToRect(l.bounds);
  if (lb.empty())
    return;
  l.resize(-100, 100, AnchorPosition.MIDDLECENTER);
  expect = w - (lb.x + lb.w);
  l.translate(expect - lb.x, 0);
  l.name = nameref.name;
}
function flipLayers(layers, nameref){
  map(union(layers, nameref), function(ln) {
    var l = ln[0];
    var n = ln[1];
    switch (l.typename) {
      case 'ArtLayer':
        flipLayer(l, n);
        break;
      case 'LayerSet':
        flipLayer(l.layers, n.layers);
        break;
    }
  });
}
function mirrorLayer(from, to, placement) {
  var l = from.duplicate(to, placement);
  l.name = to.name;
  switch (from.typename) {
    case 'ArtLayer':
      flipLayer(l, from);
      break;
    case 'LayerSet':
      flipLayers(l.layers, from.layers);
      break;
  }
}
function queryLinkID(l){
  var m = /#(.+)$/.exec(l.name);
  if (!m) return;
  m = /mirror\(([^)]+)\)/.exec(m[1]);
  if (!m) return; 
  return m[1];
}
function getGroups(l) {
  if (l.grouped) return [];
  var groups = [];
  map(l.parent.layers, function(sibling) {
    if (sibling === l) 
      return groups;    
    if (sibling.grouped)
      groups.splice(0, 0, sibling);
    else
      groups = []; 
  });
  return groups;
}
function handleLayers(layers, active, id) {
  map(layers, function(l) {
    if (l === active) return;
    var i = queryLinkID(l);
    if (i != id || active.typename != l.typename) {
      if (l.typename == 'LayerSet')
        handleLayers(l.layers, active, id);
      return;
    }
    var groups = getGroups(l);
    mirrorLayer(active, l, ElementPlacement.PLACEBEFORE);
    l.remove();
    map(groups, function(g) { if (!g.grouped) g.grouped = true; });
  });
}
function exec() {
  var active = doc.activeLayer;
  var id = queryLinkID(active);
  if (!id) {
    alert('Link ID does not found: mirror(ID)');
    return;
  }
  handleLayers(doc.layers, active, id);
}
