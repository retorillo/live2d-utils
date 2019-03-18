#include 'lib.jsx'

var doc = app.activeDocument;
var counter = 0;
doc.suspendHistory('Fill sync', 'exec()');

function queryLinkID(l){
  var m = /#(.+)$/.exec(l.name);
  if (!m) return;
  m = /fill\(([^)]+)\)/.exec(m[1]);
  if (!m) return; 
  return m[1];
}
var __glporl = null;
function getLastPathOnRasterLayer() {
  if (__glporl) return __glporl;
  var al = doc.activeLayer;
  var l = doc.artLayers.add();
  doc.activeLayer = l;
  __glporl = doc.pathItems[doc.pathItems.length - 1];
  doc.activeLayer = al;
  l.remove();
  return __glporl;
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
    // NOTE: unique vector will appears if "Shape" layer selected.
    var path = doc.pathItems[doc.pathItems.length - 1];
    if (path != getLastPathOnRasterLayer()) {
      var color = app.foregroundColor;
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putEnumerated( stringIDToTypeID('contentLayer'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
      desc.putReference( charIDToTypeID('null'), ref );
      var fillDesc = new ActionDescriptor();
      var colorDesc = new ActionDescriptor();
      colorDesc.putDouble( charIDToTypeID('Rd  '), color.rgb.red );
      colorDesc.putDouble( charIDToTypeID('Grn '), color.rgb.green );
      colorDesc.putDouble( charIDToTypeID('Bl  '), color.rgb.blue );
      fillDesc.putObject( charIDToTypeID('Clr '), charIDToTypeID('RGBC'), colorDesc );
      desc.putObject( charIDToTypeID('T   '), stringIDToTypeID('solidColorLayer'), fillDesc );
      executeAction( charIDToTypeID('setd'), desc, DialogModes.NO );
    }
    else
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
