import type { CSSProperties } from 'react'
import type { ClassName, Style } from './types.ts'

export const isString = (value: unknown): value is string =>
  typeof value === 'string'
export const isFunction = (value: unknown): value is Function =>
  typeof value === 'function'
export const isUndefined = (value: unknown): value is undefined =>
  typeof value === 'undefined'

/**
 * Merges two props objects, composing event handlers.
 * - Event handlers (on[A-Z]) are composed: user handler runs first, then default
 * - All other props: user props override defaults
 */
export function mergeProps<T extends Record<string, unknown>>(
  defaultProps: T,
  props: T,
): T {
  const result = { ...defaultProps, ...props }

  for (const key in defaultProps) {
    const isHandler = /^on[A-Z]/.test(key)
    if (isHandler && defaultProps[key] && props[key]) {
      ;(result as Record<string, unknown>)[key] = (...args: unknown[]) => {
        const userResult = (props[key] as Function)(...args)
        ;(defaultProps[key] as Function)(...args)
        return userResult
      }
    }
  }

  return result
}

/**
 * Resolves and merges className values from defaultProps and props.
 * - Resolves function values with the provided state
 * - Merges string values using clsx
 * - Function props receive the resolved default value
 */
export function resolveClassName<State>(
  state: State,
  defaultClassName?: ClassName<State>,
  propsClassName?: ClassName<State>,
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
  state: State,
  defaultStyle?: Style<State>,
  propsStyle?: Style<State>,
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

type ClassValue =
  | ClassValue[]
  | Record<string, any>
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined

export function clsx(...inputs: ClassValue[]) {
  let str = ''
  let tmp

  for (let i = 0; i < inputs.length; i++) {
    if ((tmp = arguments[i])) {
      if (isString(tmp)) {
        str += (str && ' ') + tmp
      }
    }
  }

  return str
}
