#include 'lib.jsx'

var doc = app.activeDocument;
doc.suspendHistory('Remove deselected layers', 'exec()');

function mkset() {
  var idMk = charIDToTypeID( "Mk  " );
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var refNull = new ActionReference();
  var idlayerSection = stringIDToTypeID( "layerSection" );
  refNull.putClass( idlayerSection );
  desc.putReference( idnull, refNull );
  var idFrom = charIDToTypeID( "From" );
  var refLyr = new ActionReference();
  var idLyr = charIDToTypeID( "Lyr " );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  refLyr.putEnumerated( idLyr, idOrdn, idTrgt );
  desc.putReference( idFrom, refLyr );
  executeAction( idMk, desc, DialogModes.NO );
}
function exec() {
  mkset();
  var al = doc.activeLayer;
  al.name = '(put away)';
  var dummy = doc.artLayers.add();
  dummy.name = '(dummy)';
  al.move(dummy, ElementPlacement.PLACEBEFORE);
  map(doc.layers, function(l) {
    if (al != l) {
      if (l.locked)
        l.locked = false;
      l.remove();
    }
  });
  var dummy = doc.artLayers.add();
  dummy.name = '(dummy)';
  map(al.layers, function(l) {
    l.move(dummy, ElementPlacement.PLACEAFTER);
  });
  dummy.remove();
  al.remove();
}


