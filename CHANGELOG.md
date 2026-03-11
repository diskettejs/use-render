# @diskette/use-render

## 0.13.0

### Minor Changes

- 948a999: fix: compose refs in renderSlot instead of silently dropping baseProps ref

  Move mergeRefs and assignRef from use-composed-ref.ts to utils.ts so they
  can be used outside of hooks. Update renderSlot to extract ref from both
  baseProps and props, composing them via mergeRefs. Previously, if both sides
  provided a ref, baseProps.ref was silently overwritten by props.ref in
  mergeProps since ref doesn't match the on[A-Z] event handler pattern.

## 0.12.0

### Minor Changes

- 0495385: improve props merging

## 0.11.1

### Patch Changes

- ae1c2a1: fix renderSlot render function types

## 0.11.0

### Minor Changes

- 99299b6: refactor useRenderSlot internals to use renderSlot

## 0.10.0

### Minor Changes

- 88f168c: add pure function renderSlot

## 0.9.0

### Minor Changes

- 3a2cc5a: add undefined to DataAttributes

## 0.8.0

### Minor Changes

- f4729e7: new useRenderSlot
- 6cec19a: refactor ref composition

## 0.7.0

### Minor Changes

- 1598265: initial implementation of userRenderContainer

## 0.6.1

### Patch Changes

- 409d6e3: add undefined to className and style props

## 0.6.0

### Minor Changes

- 37efd7e: refactor types to fix ComponentProps render function type

## 0.5.0

### Minor Changes

- 2a74fa5: reordered render prop args order

## 0.4.0

### Minor Changes

- 208f994: renamed useRender's defaultProps option to baseProps

## 0.3.0

### Minor Changes

- eb20ea7: improve implementation

## 0.2.0

### Minor Changes

- 6acd773: initial release
