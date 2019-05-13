# live2d-utils

**WORKING IN PROGRESS**

## preprocess.jsx

The [original preprocess script](http://sites.cybernoids.jp/cubism2/tools/jsx) is classic, and has not been updated over 5 years.

This project goal is to discover minimal and more helpful preprocess script.

### Extentions

#### Comment `#`

Following text after `#` will be always removed on layer name.

Note that, if its name is completely starting with #, such a layer will be removed from final output. See "Forcely removing".

#### Bypassing merge `*`

If name of layer set starting with `*`, such a layer set never merge in any cases, so its descendants are respectively outputted if required.

#### Forcely outputting `?`

If name of layer set or layer starting with `?`, it will be forcely output no matter whether it is invisible.

#### Unwrapping `-`

If name of layer set starting with `-`, and it had not been merged, their children are exposed from currently assigned layer set.

#### Auto splitting to LR `:`

If name of layer or layer set starting with `:`, it will be split to left and right layers. (eg. eye-l, eye-r)

- Specify horizontal location in pixel by using `#splitorigin(pixel)` to split at non-center line, otherwise, this script split at canvas center.
- Specify suffix by using `#lname(L)` and `#rname(R)`

#### Suppressing layer/vector masks `!`

If name of layer or layer sets starting with `!`, its layer/vector mask will be purged before merging.

#### Forcely removing `#`

Layer or layer sets that name starting with `#` will be forcely removed regardless of its visiblity.

#### Forcely merging `@`

Layer sets that name starting with `@` will be forcely merged no matter whether it has decendant sets.

#### Auto prefixing `-*`

Layer set that name ending with `-*` will be applied auto prefixing procedure to its decendants.

```
foo-*              => foo
  |---bar          => foo-bar
  |---baz          => foo-baz
  |---qux          => foo-qux
  |    `--- quux   => foo-quux
  `---corge-*      => foo-corge
       `--- grault => foo-corge-grault

```

## l2r.jsx

- Sync right content with left content while keeping layer structures.
- Does not support layer and vector masks.

## mirror.jsx

- Horizontal mirroring copy from current active layer to other layers that has same mirror ID.
- For example: select `leftSholder #mirror(sholder)` layer set, then load this script, all layer sets that has ID `mirror(sholder)` will be affected.

## fillall.jsx
  
- Same with `fill.jsx`, but this script can parse `# palette` layer set and instantiate accessable palette on memory, then, fill all its sibling layers and its children by using palette color.
- Powerful tool to free you from boring work, but this operation requires huge computing time. Take a cofee.

## fill.jsx
  
- Fill by current selected color by finding same `fill(id)` layers on entire document.
- For example: select `face #fill(skin)` layer, then load this script, all layers that has id `fill(skin)` will be affected.

## dup.jsx

- Duplicate "strictly" current document. This may fix broken PSD file that cannot be load by Cubism.
- Note: This process is included in `preprocess.jsx`

## clear.jsx

- Apply "Clear" action to all layers on current document with keeping current seleciton. (without Background layer) Good for clean up process.

## union.jsx

- Usable snippet for patch creation. Organize all layers and layer sets of current opened documents on into single document without merging.

## visibleonly.jsx

- Remove all hidden layers and layer sets from current document.

## selectonly.jsx

- Remove all deselected layers and layer sets from current document.

## level

- `level` can apply "Levels (Ctrl + L)" to current active layer or layer set (including children).
- Active selected layer or layer set must be has `level(I1, I2, I3, O1, O2)` instruction. Each parameters are correspond with "Levels" window, for example, `#level(0, 1.00, 255, 0, 255)`.

## exposure

- `exposure` can apply "Exposure (Image &gt; Adjustment &gt; Exposure)" to current active layer or layer set (including children).
- Active selected layer or layer set must be has `exposure(E, O, G)` instruction. Each value are correspond with "Levels" window, for example, `#exposure(0.00, 0.0000, 1.00)`.

## addlayer

- `addlayer` is set of scripts to create new layer on my naming rule with `fill(FILLID)` instruction.

## isolate.jsx

- Same behavior with Blender isolate command. Hide all layers excepting current active layers and layer that starting with `#`.
  - After this script, you can see `PRE_ISOLATION` and `POST_ISOLATION` in "Layer Comps" window. Use them to switch previous visibility states.

## mkpalette.jsx

- Powerful script to generate color palette. Should use by combining with `fill` and `addlayer` scripts and its naming rules.

## split.jsx

- Same with `:` split operation of `preprocess.jsx`.
  - Of course, `#lname(L)` `#rname(R)` `#splitorigin(x)` are avaible.

## autonr.jsx

- Execute auto numbering to current active layer set children.
  - Specify `#autonr(prefix=foobar)` to layer set, in order to put prefix before incremental number.
  - Specify `#autonr(skip)` to each of children, in order to prevent rename it.

## Reference

- [Photoshop CC Javascript Scripting Reference 2019](https://www.adobe.com/content/dam/acom/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2019.pdf)

## Licensed


Licensed under the MIT

Copyright (C) 2019 Retorillo
