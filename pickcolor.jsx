#include 'lib.jsx'
var doc = app.activeDocument;
var al;
var instr;
function bootstrap() {
  try {
    al = doc.activeLayer;
    instr = parseInstructions(al.name);
    if (!instr || !instr['fill'])
      throw '#fill(id) is not defined';
    doc.suspendHistory('Pick color (' + instr['fill'] + ')', 'exec()');
  }
  catch (e) {
    alert(e);
  }
}
function exec() {
  try {
    var pal = parsePaletteLayerSet();
    var col = pal[instr['fill']];
    if (!col)
      throw 'color "' + instr['fill'] + '" is not defined';
    app.foregroundColor = col;
  }
  catch (e) {
    alert(e);
  }
}
bootstrap();
