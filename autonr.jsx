#include 'lib.jsx'

var doc = app.activeDocument;
var counter = 0;
doc.suspendHistory('Auto Numbering', 'exec()');

function exec() {
  if (doc.activeLayer.typename != 'LayerSet') {
    alert("Select layer set and reload this script");
  }
  var globalInstr = parseInstructions(doc.activeLayer.name);
  globalInstr = globalInstr && globalInstr['autonr'] ? globalInstr['autonr'] : '';
  
  prefix = /\bprefix\s*=\s*([^\b]+)/.exec(globalInstr);
  prefix = prefix ? prefix[1] : '';
 
  var count=0;
  map( map(doc.activeLayer.layers, function(l) {
    var instr = parseInstructions(l.name);
    if (instr && instr['autonr'] && /\bskip\b/.test(instr['autonr']))
      return null;
    count++;
    return l;
  }), function(l) {
    if (l)
      l.name = buildName((count--).toString(), prefix, '', '');
  });
}


