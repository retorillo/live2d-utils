#include 'lib.jsx'

var doc = app.activeDocument;
doc.suspendHistory('Mirror linking', 'exec()');

function deactivateMasks(l) {
  var lmd = l.layerMaskDensity;
  var vmd = l.vectorMaskDensity;
  try { l.layerMaskDensity = 0; } catch (e) { }
  try { l.vectorMaskDensity = 0; } catch (e) { }
  return function() {
    try { l.layerMaskDensity = lmd; } catch (e) { }
    try { l.vectorMaskDensity = vmd; } catch (e) { }
  }
}
function flipLayer(l){
  var w = unitToNr(doc.width);
  var h = unitToNr(doc.height);
  var flipper = l.parent.layerSets.add();
  flipper.move(l, ElementPlacement.PLACEBEFORE);
  var dummy = flipper.artLayers.add();
  l.move(dummy, ElementPlacement.PLACEBEFORE);
  doc.selection.deselect();
  doc.selection.select([ [0, 0], [w, 0], [w, h], [0, h], [0, 0] ]); 
  doc.selection.fill(app.backgroundColor);
  doc.selection.deselect();
  var bounds = boundsToRect(flipper.bounds);
  if (bounds.x != 0 || bounds.y != 0 || bounds.w != w || bounds.h != h) {
    var msg = 'Current flipper does not support its content is sticked out its canvas';
    alert(msg);
    throw msg;
  }
  flipper.resize(-100, 100, AnchorPosition.MIDDLECENTER);
  l.move(flipper, ElementPlacement.PLACEBEFORE);
  flipper.remove();
}
function mirrorLayer(from, to, placement) {
  var l = from.duplicate(to, placement);
  l.name = to.name;
  flipLayer(l);
  var fixname = function(layers, nameref) {
    map(union(layers, nameref), function(union) {
      union[0].name = union[1].name;
      if (union[0].typename == 'LayerSet')
        fixname(union[0].layers, union[1].layers);
    });
  }; 
  if (l.typename == 'LayerSet')
    fixname(l.layers, from.layers);
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
