#include 'lib.jsx'

var doc = app.activeDocument;
doc.suspendHistory('Super Fill', 'exec()');

function selectPixel() {
  var idsetd = charIDToTypeID( "setd" );
  var desc1557 = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref171 = new ActionReference();
  var idChnl = charIDToTypeID( "Chnl" );
  var idfsel = charIDToTypeID( "fsel" );
  ref171.putProperty( idChnl, idfsel );
  desc1557.putReference( idnull, ref171 );
  var idT = charIDToTypeID( "T   " );
  var ref172 = new ActionReference();
  var idChnl = charIDToTypeID( "Chnl" );
  var idChnl = charIDToTypeID( "Chnl" );
  var idTrsp = charIDToTypeID( "Trsp" );
  ref172.putEnumerated( idChnl, idChnl, idTrsp );
  desc1557.putReference( idT, ref172 );
  executeAction( idsetd, desc1557, DialogModes.NO );
}
function exec() {
  if (doc.activeLayer.typename != 'ArtLayer') {
    alert("Select art layer and reload this script");
  }
  var al = doc.activeLayer;
  var instr = parseInstructions(al.name);
  var l = al.parent.artLayers.add();
  var fname;
  if (instr && instr['fill'] && /-line/.test(instr['fill'][0]))
    fname = /(\w+)-line/.exec(instr['fill'][0])[1];

  var fillcolor = app.foregroundColor;
  var pls = parsePaletteLayerSet(null, function(l) { return l.name == fname });
  if (pls && pls[fname])
    fillcolor = pls[fname];

  doc.activeLayer = l;
  doc.selection.fill(fillcolor);
  doc.activeLayer = al;
  selectPixel();
  doc.activeLayer = l;
  doc.selection.fill(fillcolor);
  doc.selection.deselect();


  l.name = fname ? fname + ' #fill(' + fname + ')' : al.name;
  l.move(al, ElementPlacement.PLACEAFTER);

  var set = al.parent.layerSets.add();
  set.name = al.name.replace(/\s*(#.*)?$/, '');
  set.move(al, ElementPlacement.PLACEBEFORE);
  l.move(set, ElementPlacement.INSIDE);
  al.move(set, ElementPlacement.INSIDE);
}
