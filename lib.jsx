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
function union(list1, list2) {
  var u = [];
  for (var c = 0; c < Math.max(list1.length, list2.length); c++)
    u.push([list1[c], list2[c]]); 
  return u;
}
function unitToNr(val) {
  m = /^-?[.0-9]+/.exec(val);
  if (!m) {
    msg = 'Cannot parse UnitValue:' + val; 
    alert(msg);
    throw msg;
  }
  return parseFloat(m[0]);
}
function boundsToRect(lb) {
  // NOTE: bounds is LTRB format: [x1, y1, x2, y2]
  var b = map(lb, unitToNr);
  return { x: b[0], y: b[1], w: b[2] - b[0], h: b[3] - b[1],
    empty: function() { return this.w == this.h && this.h == 0; } }; 
}
function resetArtLayer(l) {
  var props = [ ['blendMode', BlendMode.NORMAL],
            ['fillOpacity', 100], 
            ['pixelsLocked', false],
            ['positionLocked', false],
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
