var doc = app.activeDocument;
doc = doc.duplicate();
doc.suspendHistory('Live2D Mini Preprocess', 'exec()');

function buildName(name, prefix) {
  var builder = [];
  if (prefix && prefix.length > 0) builder.push(prefix);
  // NOTE: Cubism may fail to load if layer has contains dot
  builder.push(name.replace(/\./g, '-').replace(/(^\s+)|(\s+$)/g, '').replace(/#.+$/, ''));
  return builder.join('-');
}
function map(list, mapper) {
  var mapped = [];
  // NOTE: LayerSets and ArtLayers will be chagned on enumeration if modified,
  //       Should be freeze this volatile colleciton into fixed array.
  var freeze = [];
  for (var c = 0; c < list.length; c++)
    freeze.push(list[c]);
  for (var c = 0; c < freeze.length; c++)
    mapped.push(mapper(freeze[c]));
  return mapped;
}
function unitToNr(val) {
  return parseFloat(/^[.0-9]+/.exec(val));
}
function suppressMaskAppearance(l) {
  var r = { hasLayerMask: false, hasVectorMask: false };
  try {
    l.layerMaskDensity = 0;
    r.hasLayerMask = true;
  }
  catch (e) {
  }
  try {
    l.vectorMaskDensity = 0;
    r.hasVectorMask = true;
  }
  catch (e) {
  }
  return r;
}
function splitLayerToLR(l) {
  var c = unitToNr(doc.width) / 2;
  var h = unitToNr(doc.height);
  var w = unitToNr(doc.width);
  var leftRegion = [[0, 0], [c, 0], [c, h], [0, h], [0, 0]];
  var rightRegion = [[c, 0], [w, 0], [w, h], [c, h], [c, 0]];
  var leftLayer = l;
  var rightLayer = l.duplicate(l, ElementPlacement.PLACEAFTER);
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
function handleLayers(layers, prefix) {
  var groups = [];
  var abandon = function(l) {
    map(groups, function(gl) { gl.allLocked = false; gl.remove() });
    groups.splice(0, groups.length);
    l.allLocked = false;
    l.remove();
  };
  return map(layers, function(l) {
    if (!l.visible || /^#/.test(l.name)) {
      // NOTE: Removing groups may affect related states of related layers,
      // in this time, should not remove.
      if (l.grouped) {
        if (l.visible)
          l.visible = false;
        groups.splice(0, 0, l);
      }
      else
        abandon(l);
      return;
    }
    var suppresser = /^\(:?)!(.*)$/.exec(l.name);
    if (suppresser) {
      suppressMaskAppearance(l);
      l.name = suppresser[1] + suppresser[2].replace(/^\s+|\s+$/g, '');
    }
    var splitter = /^\:(.*)$/.exec(l.name);
    if (splitter)
      l.name = splitter[1].replace(/^\s+|\s+$/g, '');
    switch (l.typename) {
      case 'ArtLayer':
        if (l.isBackgroundLayer) {
          abandon(l);
          return;
        }
        if (l.grouped) {
          groups.splice(0, 0, l);
          return;
        }
        break;
      case 'LayerSet':
        if (!l.layers.length)  {
          abandon(l);
          return;
        }
        var prefixer = /^(.+?)(-\*)$/.exec(l.name);
        if (prefixer) l.name = prefixer[1]; 
        var forcer = /^@/
        if (forcer.exec(l.name)) {
          l.name = buildName(l.name.substr(1), prefix);
          l.merge();
        }
        else {
          var hadLayerSets = l.layerSets.length;
          handleLayers(l.layers, prefixer ? buildName(prefixer[1], prefix) : prefix);
          if (l.layers.length == 0) {
            abandon(l);
            return;
          }
          // NOTE: On this version, if l-set has clipping mask, merged them to one l forcely.
          // TODO: Improve this behavior by implementing the following:
          // (1) merge l-set first
          // (2) organize groups and duplicated merged l-set into newly crated l-set
          // (3) merge them into one l
          // (4) select pixels l-set created step 1, and invert selection
          // (5) remove pixels from l created step 3
          if (groups.length == 0 && hadLayerSets)
            return;
          l = l.merge();
        }
        break;
      default:
        return;
    }
    var name = buildName(l.name, prefix);
    var merger = doc.layerSets.add();
    merger.name = l.name + ' (merger)'
    merger.move(l, ElementPlacement.PLACEAFTER);
    l.move(merger, ElementPlacement.INSIDE);
    var placer = l;
    map(groups, function(gl) {
      if (!gl.visible) {
        gl.allLocked = false;
        gl.remove();
        return;
      }
      gl.move(placer, ElementPlacement.PLACEBEFORE);
      gl.grouped = true;
      placer = gl;
    });
    groups.splice(0, groups.length);
    merger.name = name;
    if (!merger.layers.length) {
      merger.remove();
      return;
    }
    merged = merger.merge(); 
    if (splitter)
      splitLayerToLR(merged);
  });
}
function exec() {
  handleLayers(doc.layers);
}