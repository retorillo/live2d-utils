var doc = app.activeDocument;
doc.suspendHistory('Mirror linking', 'exec()');

function union(list1, list2) {
  var u = [];
  for (var c = 0; c < Math.max(list1.length, list2.length); c++)
    u.push([list1[c], list2[c]]); 
  return u;
}
function freeze(list) {
  var freezed = [];
  for (var c = 0; c < list.length; c++)
    freezed.push(list[c]);
  return freezed;  
}
function map(list, mapper) {
  var mapped = [];
  var f = freeze(list);
  for (var c = 0; c < f.length; c++)
    mapped.push(mapper(f[c]));
  return mapped;
}
function unitToNr(val) {
  return parseFloat(/^[.0-9]+/.exec(val));
}
function resetArtLayer(l) {
  var props = [ ['blendMode', BlendMode.NORMAL],
            ['fillOpacity', 100], 
            ['pixelsLocked', false],
            ['transparentPixelsLocked', false],
            ['visible', true] ];
  var state = {};
  state.applyTo = function(l) {
    s = this;
    map(props, function(p) {
      if (l[p[0]] != s[p[0]])
        l[p[0]] = s[p[0]];
    });
  };
  map(props, function(p) {
    state[p[0]] = l[p[0]];
    l[p[0]] = p[1];
  });
  return state;
}
function boundsToRect(lb) {
  // NOTE: bounds is LTRB format: [x1, y1, x2, y2]
  var b = map(lb, unitToNr);
  return { x: b[0], y: b[1], w: b[2] - b[0], h: b[3] - b[1],
    empty: function() { return this.w == this.h && this.h == 0; } }; 
}
function flipLayer(l, nameref){
  var w = unitToNr(doc.width);
  var lb = boundsToRect(l.bounds);
  if (lb.empty())
    return;
  l.resize(-100, 100, AnchorPosition.MIDDLECENTER);
  expect = w - (lb.x + lb.w);
  l.translate(expect - lb.x, 0);
  l.name = nameref.name;
}
function flipLayers(layers, nameref){
  map(union(layers, nameref), function(ln) {
    var l = ln[0];
    var n = ln[1];
    switch (l.typename) {
      case 'ArtLayer':
        flipLayer(l, n);
        break;
      case 'LayerSet':
        flipLayer(l.layers, n.layers);
        break;
    }
  });
}
function mirrorLayer(from, to, placement) {
  var l = from.duplicate(to, placement);
  l.name = to.name;
  switch (from.typename) {
    case 'ArtLayer':
      flipLayer(l, from);
      break;
    case 'LayerSet':
      flipLayers(l.layers, from.layers);
      break;
  }
}
function l2r(l) {
  var state = resetArtLayer(l);
  var c = unitToNr(doc.width) / 2;
  var h = doc.height;
  var w = unitToNr(doc.width);
  var leftRegion = [[0, 0], [c, 0], [c, h], [0, h], [0, 0]];
  var rightRegion = [[c, 0], [w, 0], [w, h], [c, h], [c, 0]];
  doc.activeLayer = l;
  doc.selection.select(rightRegion);
  doc.selection.clear();
  doc.selection.deselect();
  var lb = boundsToRect(l.bounds);
  if (lb.empty())
    return l;
  var right = l.duplicate(l, ElementPlacement.PLACEBEFORE);
  right.resize(-100, 100, AnchorPosition.MIDDLECENTER);
  expect = w - (lb.x + lb.w);
  right.translate(expect - lb.x, 0);
  merged = right.merge(); 
  state.applyTo(merged);
  return merged;
}
function queryLinkID(l){
  var m = /#(.+)$/.exec(l.name);
  if (!m) return;
  m = /mirror\(([^)]+)\)/.exec(m[1]);
  if (!m) return; 
  return m[1];
}
function getGroups(l) {
  if (l.grouped) return [];
  var groups = [];
  map(l.parent.layers, function(sibling) {
    if (sibling === l) 
      return groups;    
    if (sibling.grouped)
      groups.splice(0, 0, sibling);
    else
      groups = []; 
  });
  return groups;
}
function handleLayers(layers, active, id) {
  map(layers, function(l) {
    if (l === active) return;
    var i = queryLinkID(l);
    if (i != id || active.typename != l.typename) {
      if (l.typename == 'LayerSet')
        handleLayers(l.layers, active, id);
      return;
    }
    var groups = getGroups(l);
    mirrorLayer(active, l, ElementPlacement.PLACEBEFORE);
    l.remove();
    map(groups, function(g) { if (!g.grouped) g.grouped = true; });
  });
}
function exec() {
  var active = doc.activeLayer;
  var id = queryLinkID(active);
  if (!id) {
    alert('Link ID does not found: mirror(ID)');
    return;
  }
  handleLayers(doc.layers, active, id);
}
