#include 'lib.jsx'
var doc = app.activeDocument;
var al;
var instr;
var fillId;
function bootstrap() {
  al = doc.activeLayer;
  instr = parseInstructions(al.name);
  if (!instr || !instr['fill'])
    throw '#fill(id) is not defined';
  if (instr['fill'].length > 1)
    throw '#fill(id) too many arguments';
  fillId = instr['fill'][0];
  doc.suspendHistory('Pick color (' + fillId + ')', 'exec()');
}
function exec() {
  var criteria = fillId.split('-')[0];
  var filter = function(l) { return l.name == criteria };
  var pal = parsePaletteLayerSet(null, filter);
  var col = pal[fillId];
  if (!col)
    throw 'color "' + fillId + '" is not defined';
  app.foregroundColor = col;
}
bootstrap();
