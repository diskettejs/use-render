import { clsx } from 'clsx'
import type { CSSProperties } from 'react'
import type { ClassNameResolver, StyleResolver } from './types.ts'

export const isFunction = (value: unknown): value is Function =>
  typeof value === 'function'
export const isUndefined = (value: unknown): value is undefined =>
  typeof value === 'undefined'

/**
 * Resolves and merges className values from defaultProps and props.
 * - Resolves function values with the provided state
 * - Merges string values using clsx
 * - Function props receive the resolved default value
 */
export function resolveClassName<State>(
  defaultClassName: ClassNameResolver<State>,
  propsClassName: ClassNameResolver<State>,
  state: State,
): string | undefined {
  const resolvedDefault = isFunction(defaultClassName)
    ? defaultClassName(state)
    : defaultClassName

  if (!isUndefined(propsClassName)) {
    if (isFunction(propsClassName)) {
      return propsClassName(state, resolvedDefault)
    } else {
      return clsx(resolvedDefault, propsClassName)
    }
  } else {
    return resolvedDefault
  }
}

/**
 * Resolves and merges style values from defaultProps and props.
 * - Resolves function values with the provided state
 * - Merges object values using object spread
 * - Function props receive the resolved default value
 */
export function resolveStyle<State>(
  defaultStyle: StyleResolver<State>,
  propsStyle: StyleResolver<State>,
  state: State,
): CSSProperties | undefined {
  const resolvedDefault = isFunction(defaultStyle)
    ? defaultStyle(state)
    : defaultStyle

  if (!isUndefined(propsStyle)) {
    if (isFunction(propsStyle)) {
      return propsStyle(state, resolvedDefault)
    } else {
      return resolvedDefault
        ? { ...resolvedDefault, ...propsStyle }
        : propsStyle
    }
  } else {
    return resolvedDefault
  }
}
