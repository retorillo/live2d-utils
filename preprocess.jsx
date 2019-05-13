#include 'lib.jsx'

var counter = 0;
var sets = {};
var doc = app.activeDocument;
doc.suspendHistory('Live2D Preprocess', 'exec()');

function processLayers(layers, prefix) {
  var groups = [];
  var abandon = function(l) {
    map(groups, function(gl) { gl.allLocked = false; gl.remove() });
    groups.splice(0, groups.length);
    l.allLocked = false;
    l.remove();
  };
  return map(layers, function(l) {
    var m, forcer, suppressor, splitter, unwrapper, appearer, bypasser;
    var name = l.name;
    while (m = /^[-@!:?*]/.exec(name)) {
      name = name.substr(1).replace(/^\s+/, '');
      switch (m[0]) {
        case '-':
          unwrapper = true;
          break;
        case '@':
          forcer = true;
          break;
        case '!':
          suppressor = true;
          deleteMasks(l);
          break;
        case ':':
          splitter = true;
          break;
        case '?':
          appearer = true;
          l.visible = true;
          break;
        case '*':
          bypasser = true;
          break;
      }
    }
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
    l.name = name.replace(/^\s+|\s+$/g, '');

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
        if (!forcer) {
          var prefixer = /^(.+)(-\*)\s*(#.*)?$/.exec(l.name);
          if (prefixer) l.name = prefixer[1]; 
          var hadLayerSets = l.layerSets.length;
          processLayers(l.layers, prefixer ? buildName(prefixer[1], prefix) : prefix);
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
          if (groups.length == 0 && hadLayerSets) {
            if (unwrapper)
              unwrap(l);
            return;
          }
        }
        if (bypasser)
          return;
        l = merge(l); // l.merge();
        break;
      default:
        return;
    }
    var merged;
    var name = buildName(l.name, prefix);
    if (groups.length > 0) {
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
    }
    else {
      merged = merge(l);
      merged.name = name;
    }
    if (splitter)
      merged = splitLayerToLR(merged);
    else
      merged = [ merged ];
  });
}
function finalizeLayers(layers) {
  map(layers, function(l) {
    if (l.name.indexOf('#') != -1)
      l.name = l.name.replace(/^([^#\s]+).*$/, '$1');
    if (l.typename == 'LayerSet')
      finalizeLayers(l.layers);
    else {
      try {
        applyLayerMask(l);
      }
      catch (e) {
      }
    }
    counter++;
  });
}
function exec() {
  doc = duplicateDocument(doc, '-preprocessed');
  processLayers(doc.layers);
  finalizeLayers(doc.layers);  
  alert(counter + ' layers were successfully outputted.'
     + ' There were no name confliction found.');
}
