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

function handleLayers(layers) {
  seq(layers).each(function(layer) {
    if (!layer.visible) {
      layer.remove();
    }
  });
}

function handleLayerSets(layerSets) {
  seq(layerSets).each(function(set) {
    if (!set.visible) {
      set.remove();
      return;
    }
    handleLayers(set.layers);
    if (set.layerSets.length > 0) {
      handleLayerSets(set.layerSets);
      return;
    }
    set.merge();
  });
}

function exec() {
  handleLayers(doc.layers);
  handleLayerSets(doc.layerSets);
}


