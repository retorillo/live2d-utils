var doc = app.activeDocument;
doc.suspendHistory('Live2D Mini Preprocess', 'exec()');

function seq(a) {
  var r = [];
  for (var c = 0; c < a.length; c++)
    r.push(a[c]);
  r.each = function(m) {
    for (var c = 0; c < this.length; c++) m(this[c]); 
  };
  return r;
} 

function handleArtLayers(layers) {
  seq(layers).each(function(layer) {
    if (!layer.visible) {
      layer.remove();
      return;
    }
    if (layer.isBackgroundLayer)
      return;
    set = doc.layerSets.add();
    set.name = layer.name;
    set.move(layer, ElementPlacement.PLACEBEFORE);
    layer.move(set, ElementPlacement.INSIDE);
    set.merge(); 
  });
}

function handleLayerSets(sets) {
  seq(sets).each(function(set) {
    if (!set.visible || !(set.artLayers.length + set.layerSets.length))  {
      set.remove();
      return;
    }
    handleArtLayers(set.artLayers);
    if (set.layerSets.length > 0) {
      handleLayerSets(set.layerSets);
      return;
    }
    set.merge();
  });
}

function exec() {
  handleArtLayers(doc.artLayers);
  handleLayerSets(doc.layerSets);
}
