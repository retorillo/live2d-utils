#include 'lib.jsx'
var doc = app.activeDocument;
var al;
var instr, from, to;
function bootstrap() {
  al = doc.activeLayer;
  instr = parseInstructions(al.name);
  if (!instr || !instr['replace'])
    throw '#replace(from, to) is not defined';
  from = instr['replace'][0];
  to = instr['replace'][1];
  doc.suspendHistory('Replace (' + [from, to].join(' => ') + ')', 'exec()');
}
function handleLayers(layers) {
  for (var c = 0; c < layers.length; c++) {
    layers[c].name = layers[c].name.replace(from, to);
    if (layers[c].typename == 'LayerSet')
      handleLayers(layers[c].layers);
  }
}
function exec() {
  handleLayers([doc.activeLayer]);
}
bootstrap();
