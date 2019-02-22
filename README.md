# Live2D Mini Preprocess

**WORKING IN PROGRESS**

The [original preprocess script](http://sites.cybernoids.jp/cubism2/tools/jsx) is classic, and has not been updated over 5 years.

This project goal is to discover minimal and more helpful preprocess script.

## Extentions

### Forcing merge

Layer sets that name starting with `@` will be forcely merged no matter whether it has decendant sets.

### Auto renamer

Layer set that name ending with `-*` will be applied auto renamer procedure to its decendants.

```
wear-*
  |---top     => wear-top
  `---bottom  => wear-bottom
```

## Reference

- [Photoshop CC Javascript Scripting Reference 2019](https://www.adobe.com/content/dam/acom/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2019.pdf)

## Licensed

Authored by Retorillo

No Rights Reserved (CC 0)
