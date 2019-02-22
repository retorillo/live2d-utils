var doc = app.activeDocument;
doc.suspendHistory('Live2D Mini Preprocess', 'exec()');

function safeName(name) {
  // NOTE: Cubism may fail to load if layer has contains dot
  return name.replace(/\./g, '-');
}

function seq(a) {
  var r = [];
  for (var c = 0; c < a.length; c++)
    r.push(a[c]);
  r.each = function(m) {
    for (var c = 0; c < this.length; c++)
      m(this[c]); 
  };
  r.reversed_each = function(m) {
    for (var c = this.length - 1; c >= 0; c--)
      m(this[c]);
  }
  return r;
} 

function handleArtLayers(layers) {
  // NOTE: grouped = clipping masked
  groupedLayers = seq([]);
  seq(layers).each(function(layer) {
    if (!layer.visible) {
      layer.remove();
      return;
    }
    if (layer.isBackgroundLayer)
      return;
    if (layer.grouped) {
      groupedLayers.push(layer);
      return
    }
    set = doc.layerSets.add();
    set.name = layer.name;
    set.move(layer, ElementPlacement.PLACEBEFORE);
    layer.move(set, ElementPlacement.INSIDE);

    placeTarget = layer;
    groupedLayers.reversed_each(function(l) {
      l.move(placeTarget, ElementPlacement.PLACEBEFORE);
      l.grouped = true;
      placeTarget = l;
    });
    groupedLayers = seq([]);
    layer.name = safeName(layer.name);
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
    set.name = safeName(set.name);
    set.merge();
  });
}

function exec() {
  handleArtLayers(doc.artLayers);
  handleLayerSets(doc.layerSets);
}
