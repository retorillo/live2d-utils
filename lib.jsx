function freeze(list) {
  if (list instanceof Array && list.__freezed) return list;
  var freezed = [];
  for (var c = 0; c < list.length; c++)
    freezed.push(list[c]);
  freezed.__freezed = true;
  return freezed;  
}
function map(list, mapper, nonfreeze) {
  var purger = {};
  var mapped = [];
  var f = nonfreeze ? list : freeze(list);
  for (var c = 0, r; c < f.length; c++) {
    r = mapper(f[c], purger);
    if (r === purger) continue;
    mapped.push(r);
  }
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
  // NOTE: bounds is LTRB or RTLB format
  var b = map(lb, unitToNr);
  l = Math.min(b[0], b[2]);
  r = Math.max(b[0], b[2]);
  return { x: l, y: b[1], w: r - l, h: b[3] - b[1],
    empty: function() { return this.w == this.h && this.h == 0; },
    toString: function() { return [ this.x, this.y, this.w, this.h ].join(); } }; 
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
// NOTE: Newly created document can be successfully loaded in good chance by Cubism
function duplicateDocument(src, suffix) {
  var dst = app.documents.add(src.width, src.height, src.resolution,
    src.name.replace(/\.psd$/i, '') + suffix, NewDocumentMode.RGB);
  var init = dst.layers[0];
  var instgt = init
  var statusQueue = [];
  map(src.layers, function(l) {
    // Only can duplicate in frontmost document
    app.activeDocument = src;
    instgt = l.duplicate(instgt, 
      instgt === init ? ElementPlacement.PLACEBEFORE : ElementPlacement.PLACEAFTER);
    statusQueue.push([instgt, l]);
  });
  app.activeDocument = dst;
  // Only can remove and modify in frontmost document
  init.remove();
  map(statusQueue, function(i) {
    i[0].name = i[1].name;
    i[0].visible = i[1].visible;
    if (i[0].typename == 'ArtLayer' && i[0].grouped != i[1].grouped)
      i[0].grouped = i[1].grouped;
  });
  return dst; 
}
function unwrap(set) {
  if (set.typename != 'LayerSet')
    throw 'Invalid argument: set must be LayerSet'; 
  var exposed = freeze(set.layers);
  map(exposed, function(l) {
    l.move(set, ElementPlacement.PLACEBEFORE);
  }); 
  set.remove();
  return exposed;
}
function selectionToLayerSet() {
  var idMk = charIDToTypeID( "Mk  " );
  var descMk = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var refnull = new ActionReference();
  var idlayerSection = stringIDToTypeID( "layerSection" );
  refnull.putClass( idlayerSection );
  descMk.putReference( idnull, refnull );
  var idFrom = charIDToTypeID( "From" );
  var refFrom = new ActionReference();
  var idLyr = charIDToTypeID( "Lyr " );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  refFrom.putEnumerated( idLyr, idOrdn, idTrgt );
  descMk.putReference( idFrom, refFrom );
  var idlayerSectionStart = stringIDToTypeID( "layerSectionStart" );
  descMk.putInteger( idlayerSectionStart, 4 );
  var idlayerSectionEnd = stringIDToTypeID( "layerSectionEnd" );
  descMk.putInteger( idlayerSectionEnd, 5 );
  var idNm = charIDToTypeID( "Nm  " );
  descMk.putString( idNm, """rough""" );
  executeAction( idMk, descMk, DialogModes.NO );
  return doc.activeLayer;
}

var LayerColor     = {};
LayerColor.RED     = 'Rd  ';
LayerColor.ORANGE  = 'Orng';
LayerColor.YELLOW  = 'Ylw ';
LayerColor.GREEN   = 'Grn ';
LayerColor.BLUE    = 'Bl  ';
LayerColor.VIOLET  = 'Vlt ';
LayerColor.GLEY    = 'Gry ';
LayerColor.NONE    = 'None';

function getDocument(l) {
  while (l.typename != 'Document' && l.parent)
    l = l.parent;
  return l;
}
function setLayerColor(l, color) {
  var ad = app.activeDocument;
  var al = ad.activeLayer;
  var doc = app.activeDocument = getDocument(l);
  doc.activeLayer = l;
  var idsetd = charIDToTypeID( "setd" );
  var descSetd = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref = new ActionReference();
  var idLyr = charIDToTypeID( "Lyr " );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  ref.putEnumerated( idLyr, idOrdn, idTrgt );
  descSetd.putReference( idnull, ref );
  var idT = charIDToTypeID( "T   " );
  var descT = new ActionDescriptor();
  var idClr = charIDToTypeID( "Clr " );
  var idClr = charIDToTypeID( "Clr " );
  var idNone = charIDToTypeID( color );
  descT.putEnumerated( idClr, idClr, idNone );
  var idLyr = charIDToTypeID( "Lyr " );
  descSetd.putObject( idT, idLyr, descT );
  executeAction( idsetd, descSetd, DialogModes.NO ); 
  app.activeDocument = ad;
  ad.activeLayer = al;
}
function selectLayerMask() {
  var idslct = charIDToTypeID( "slct" );
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref = new ActionReference();
  var idChnl = charIDToTypeID( "Chnl" );
  var idChnl = charIDToTypeID( "Chnl" );
  var idMsk = charIDToTypeID( "Msk " );
  ref.putEnumerated( idChnl, idChnl, idMsk );
  desc.putReference( idnull, ref );
  var idMkVs = charIDToTypeID( "MkVs" );
  desc.putBoolean( idMkVs, false );
  executeAction( idslct, desc, DialogModes.NO );
}
function selectVectorMask() {
  var idslct = charIDToTypeID( "slct" );
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref = new ActionReference();
  var idPath = charIDToTypeID( "Path" );
  var idPath = charIDToTypeID( "Path" );
  var idvectorMask = stringIDToTypeID( "vectorMask" );
  ref.putEnumerated( idPath, idPath, idvectorMask );
  var idLyr = charIDToTypeID( "Lyr " );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  ref.putEnumerated( idLyr, idOrdn, idTrgt );
  desc.putReference( idnull, ref );
  executeAction( idslct, desc, DialogModes.NO );
}
function deleteLayerMask(l) {
  var ad = app.activeDocument;
  var al = ad.activeLayer;
  var doc = app.activeDocument = getDocument(l);
  doc.activeLayer = l;
  selectLayerMask();
  var idDlt = charIDToTypeID( "Dlt " );
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref = new ActionReference();
  var idChnl = charIDToTypeID( "Chnl" );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  ref.putEnumerated( idChnl, idOrdn, idTrgt );
  desc.putReference( idnull, ref );
  executeAction( idDlt, desc, DialogModes.NO );
  app.activeDocument = ad;
  ad.activeLayer = al;
}
function deleteVectorMask(l) {
  var ad = app.activeDocument;
  var al = ad.activeLayer;
  var doc = app.activeDocument = getDocument(l);
  doc.activeLayer = l;
  selectVectorMask();
  var idDlt = charIDToTypeID( "Dlt " );
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref = new ActionReference();
  var idPath = charIDToTypeID( "Path" );
  var idPath = charIDToTypeID( "Path" );
  var idvectorMask = stringIDToTypeID( "vectorMask" );
  ref.putEnumerated( idPath, idPath, idvectorMask );
  var idLyr = charIDToTypeID( "Lyr " );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  ref.putEnumerated( idLyr, idOrdn, idTrgt );
  desc.putReference( idnull, ref );
  executeAction( idDlt, desc, DialogModes.NO );
  app.activeDocument = ad;
  ad.activeLayer = al;
}
function deleteMasks(l) {
  try { deleteVectorMask(l); }
  catch (e) { }
  try { deleteLayerMask(l); }
  catch (e) { }
}
function applyLayerMask(l) {
  var ad = app.activeDocument;
  var al = ad.activeLayer;
  var doc = app.activeDocument = getDocument(l);
  doc.activeLayer = l;
  selectLayerMask();
  var idDlt = charIDToTypeID( "Dlt " );
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref = new ActionReference();
  var idChnl = charIDToTypeID( "Chnl" );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  ref.putEnumerated( idChnl, idOrdn, idTrgt );
  desc.putReference( idnull, ref );
  var idAply = charIDToTypeID( "Aply" );
  desc.putBoolean( idAply, true );
  executeAction( idDlt, desc, DialogModes.NO );
  app.activeDocument = ad;
  ad.activeLayer = al;
}
function rasterizeVectorMask(l) {
  var ad = app.activeDocument;
  var al = ad.activeLayer;
  var doc = app.activeDocument = getDocument(l);
  doc.activeLayer = l;
  selectVectorMask();
  var idrasterizeLayer = stringIDToTypeID( "rasterizeLayer" );
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref = new ActionReference();
  var idLyr = charIDToTypeID( "Lyr " );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  ref.putEnumerated( idLyr, idOrdn, idTrgt );
  desc.putReference( idnull, ref );
  var idWhat = charIDToTypeID( "What" );
  var idrasterizeItem = stringIDToTypeID( "rasterizeItem" );
  var idvectorMask = stringIDToTypeID( "vectorMask" );
  desc.putEnumerated( idWhat, idrasterizeItem, idvectorMask );
  executeAction( idrasterizeLayer, desc, DialogModes.NO );
  app.activeDocument = ad;
  ad.activeLayer = al;
}
function rasterizeLayer(l) {
  var ad = app.activeDocument;
  var al = ad.activeLayer;
  var doc = app.activeDocument = getDocument(l);
  var idrasterizeLayer = stringIDToTypeID( "rasterizeLayer" );
  var desc = new ActionDescriptor();
  var idnull = charIDToTypeID( "null" );
  var ref = new ActionReference();
  var idLyr = charIDToTypeID( "Lyr " );
  var idOrdn = charIDToTypeID( "Ordn" );
  var idTrgt = charIDToTypeID( "Trgt" );
  ref.putEnumerated( idLyr, idOrdn, idTrgt );
  desc.putReference( idnull, ref );
  executeAction( idrasterizeLayer, desc, DialogModes.NO );
  app.activeDocument = ad;
  ad.activeLayer = al;
}
function merge(l) {
  if (l.typename == 'ArtLayer')
    try { rasterizeLayer(l); } catch (e) {}
  else
    l = l.merge();
  try { rasterizeVectorMask(l); } catch (e) {}
  try { applyLayerMask(l); } catch (e) {}
  return l;
}
function parseInstructions(name) {
  var names = name.split(/#/g);
  var instrs = [];
  var r = /^\s*([a-z][a-z0-9]+)\s*\(([^)]+)\)/i
  for (var c = 1; c < names.length; c++) {
    var i = names[c];
    var m = r.exec(i);
    if (!m) continue;
    var I = { };
    I.name = m[1];
    I.arguments = map(m[2].split(/,/g), function(a) {
      var b = a.replace(/^\s+|\s+$/g, '');
      var c = parseFloat(b);
      return c !== c ? b : c;
    });
    instrs.push(I);
    instrs[I.name] = I.arguments;
  }
  return instrs;
}
