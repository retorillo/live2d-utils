var doc = app.activeDocument;
doc = doc.duplicate();
doc.suspendHistory('Live2D Mini Preprocess', 'exec()');

function buildName(name, prefix) {
  builder = [];
  if (prefix && prefix.length > 0) builder.push(prefix);
  // NOTE: Cubism may fail to load if layer has contains dot
  builder.push(name.replace(/\./g, '-').replace(/(^\s+)|(\s+$)/g, ''));
  return builder.join('-');
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

function suppressMaskAppearance(layer) {
  r = { hasLayerMask: false, hasVectorMask: false };
  try {
    layer.layerMaskDensity = 0;
    r.hasLayerMask = true;
  }
  catch (e) {
  }
  try {
    layer.vectorMaskDensity = 0;
    r.hasVectorMask = true;
  }
  catch (e) {
  }
  return r;
}

function splitLayerToLR(layer) {
  c = doc.width / 2;
  h = doc.height;
  w = doc.width;
  leftRegion = [[0, 0], [c, 0], [c, h], [0, h], [0, 0]];
  rightRegion = [[c, 0], [w, 0], [w, h], [c, h], [c, 0]];
  leftLayer = layer;
  rightLayer = layer.duplicate();
  rightLayer.move(layer, ElementPlacement.PLACEAFTER);
  rightLayer.name = leftLayer.name + '-r'; 
  leftLayer.name += '-l';
  doc.activeLayer = leftLayer;
  doc.selection.select(rightRegion);
  doc.selection.clear();
  doc.activeLayer = rightLayer;
  doc.selection.select(leftRegion);
  doc.selection.clear();
  doc.selection.deselect();
}

function handleArtLayers(layers, prefix) {
  // NOTE: grouped = clipping masked
  groupedLayers = seq([]);
  seq(layers).each(function(layer) {
    if (!layer.visible || /^#/.test(layer.name)) {
      layer.remove();
      return;
    }
    if (layer.isBackgroundLayer)
      return;
    if (layer.grouped) {
      groupedLayers.push(layer);
      return
    }
    suppresser = /^\(:?)!(.*)$/.exec(layer.name);
    if (suppresser) {
      suppressMaskAppearance(layer);
      layer.name = suppresser[1] + suppresser[2].replace(/^\s+|\s+$/g, '');
    }
    splitter = /^\:(.*)$/.exec(layer.name);
    if (splitter) {
      layer.name = splitter[1].replace(/^\s+|\s+$/g, '');
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
    layer.name = buildName(layer.name, prefix);
    merged = set.merge(); 
    if (splitter)
      splitLayerToLR(merged);
  });
}

function handleLayerSets(sets, prefix) {
  seq(sets).each(function(set) {
    if (!set.visible || /^#/.test(set.name) || !(set.artLayers.length + set.layerSets.length))  {
      set.remove();
      return;
    }
    prefixer = /^(.+?)(-\*)$/.exec(set.name);
    if (prefixer) set.name = prefixer[1]; 
    if (/^@/.exec(set.name)) {
      set.name = buildName(set.name.substr(1), prefix);
      set.merge();
      return;
    }
    handleArtLayers(set.artLayers, prefixer ? buildName(prefixer[1], prefix) : prefix);
    if (set.layerSets.length > 0) {
      handleLayerSets(set.layerSets, prefixer ? buildName(prefixer[1], prefix) : prefix);
      return;
    }
    set.name = buildName(set.name, prefix);
    layer = set.merge();
    // NOTE: Set may have layer/vector mask no matter the merge()
    // In addition, this call allows to ignore mask-suppressor in this function.
    handleArtLayers([layer]);
  });
}

function exec() {
  handleArtLayers(doc.artLayers);
  handleLayerSets(doc.layerSets);
}
