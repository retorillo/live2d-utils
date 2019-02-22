# Live2D Mini Preprocess

**WORKING IN PROGRESS**

The [original preprocess script](http://sites.cybernoids.jp/cubism2/tools/jsx) is classic, and has not been updated over 5 years.

This project goal is to discover minimal and more helpful preprocess script.

## Extentions

### Forcing remove

Layer or layer sets that name starting with `#` will be forcely removed no matter its visiblity.

### Forcing merge

Layer sets that name starting with `@` will be forcely merged no matter whether it has decendant sets.

### Auto prefixer

Layer set that name ending with `-*` will be applied auto prefixing procedure to its decendants.

```
foo-*
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
