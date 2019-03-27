#include 'lib.jsx'

var base = app.activeDocument;
var tgt = app.documents.add(base.width, base.height, base.resolution,
  base.name.replace(/\.psd$/i, '-unioned'), NewDocumentMode.RGB);
var tgtl = tgt.layers[tgt.layers.length - 1];
var docs = app.documents;
tgt.suspendHistory('Union opened files', 'exec()');

function handleDocument(doc) {
  var syncer = [];
  map(doc.layers, function(l) {
    app.activeDocument = doc;
    // NOTE: tgt first layer is 'Background'
    tgtl = l.duplicate(tgtl, tgt.layers.length > 1 ?
      ElementPlacement.PLACEAFTER : ElementPlacement.PLACEBEFORE);
    syncer.push([tgtl, l]);
  });
  app.activeDocument = tgt;
  var syncNames = function (i) {
    i[0].name = i[1].name;
    i[0].visible = i[1].visible;
    if (i[0].typename == 'ArtLayer' && i[0].grouped != i[1].grouped)
      i[0].grouped = i[1].grouped;
    // NOTE: not required ?
    // if (i[0].typename == 'LayerSet')
    //  syncNames(union(i[0].layers, i[1].layers));
  };
  map(syncer, syncNames);
}
function exec() {
  var unioned = [];
  var skipped = [];
  map(app.documents, function(d) {
    if (d === tgt)
      return;
    if (d.width !== base.width || d.height !== base.height || d.resolution !== base.resolution) {
      skipped.push(d);
      return;
    }
    handleDocument(d);
    unioned.push(d);
  }); 
  if (tgt.layers.length > 1)
    tgt.layers[tgt.layers.length - 1].remove();
  alert(unioned.length + ' documents were successfully unioned');
  if (skipped.length > 0)
    alert('WARNING: the following files were skipped because of resolution different: '
      + map(skipped, function(d) { return d.name }).join() );
}
