# live2d-utils

**WORKING IN PROGRESS**

## preprocess.jsx

The [original preprocess script](http://sites.cybernoids.jp/cubism2/tools/jsx) is classic, and has not been updated over 5 years.

This project goal is to discover minimal and more helpful preprocess script.

### Extentions

#### Comment `#`

Following text after `#` will be always removed on layer name.

Note that, if its name is completely starting with #, such a layer will be removed from final output. See "Forcely removing".

#### Unwrapping `-`

If name of layer set starting with `-`, and it had not been merged, their children are exposed from currently assigned layer set.

#### Auto splitting to LR `:`

If name of layer or layer set starting with `:`, it will be split to left and right layers. (eg. eye-l, eye-r)

NOTE: This feature will produce expected result only if each left and right contents placed at symmetrical position on its layer or merged layer set.

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

## fill.jsx
  
- Fill by current selected color by finding same `fill(id)` layers on entire document.
- For example: select `face #fill(skin)` layer, then load this script, all layers that has id `fill(skin)` will be affected.

## dup.jsx

- Duplicate "strictly" current document. This may fix broken PSD file that cannot be load by Cubism.
- Note: This process is included in `preprocess.jsx`

## Reference

- [Photoshop CC Javascript Scripting Reference 2019](https://www.adobe.com/content/dam/acom/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2019.pdf)

## Licensed


Licensed under the MIT

Copyright (C) 2019 Retorillo
