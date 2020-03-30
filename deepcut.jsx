#include 'lib.jsx'

var doc = app.activeDocument;

function duplicate(l) {
  var al = doc.activeLayer;
  doc.activeLayer = l;
  var idDplc = charIDToTypeID( "Dplc" );
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref = new ActionReference();
  var idLyr = charIDToTypeID( "Lyr " );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  ref.putEnumerated( idLyr, idOrdn, idTrgt );
  desc.putReference( idnull, ref );
  var idVrsn = charIDToTypeID( "Vrsn" );
  desc.putInteger( idVrsn, 5 );
  executeAction( idDplc, desc, DialogModes.NO );
  var r = doc.activeLayer;
  doc.activeLayer = al;
  return r;
}
function applyToLayerSet(set) {
  map(set.layers, function(l) {
    doc.activeLayer = l;
    if (l.typename == 'LayerSet')
      applyToLayerSet(l);
    if (l.typename == 'ArtLayer')
      doc.selection.clear();
  });
}
function exec() {
  var al = doc.activeLayer;
  if (doc.activeLayer.typename != 'LayerSet') {
    alert('deepcut script requires layer set');
  }

  var dupl = duplicate(doc.activeLayer);
  dupl.name = al.name + ' (deepcut)';
  applyToLayerSet(al);
  doc.activeLayer = al;

  doc.selection.invert();
  applyToLayerSet(dupl);
  doc.activeLayer = al;
}
exec();
