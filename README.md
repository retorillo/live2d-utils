# Live2D Mini Preprocess

**WORKING IN PROGRESS**

The [original preprocess script](http://sites.cybernoids.jp/cubism2/tools/jsx) is classic, and has not been updated over 5 years.

This project goal is to discover minimal and more helpful preprocess script.

## Extentions

### Suppressing layer/vector masks `!`

If name of layer or layer sets starting with `!`, its layer/vector mask will be purged before merging.

### Forcely removing `#`

Layer or layer sets that name starting with `#` will be forcely removed regardless of its visiblity.

### Forcely merging `@`

Layer sets that name starting with `@` will be forcely merged no matter whether it has decendant sets.

### Auto prefixing `-*`

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

## Reference

- [Photoshop CC Javascript Scripting Reference 2019](https://www.adobe.com/content/dam/acom/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2019.pdf)

## Licensed

Authored by Retorillo

No Rights Reserved (CC 0)
