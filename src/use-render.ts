import type { CSSProperties, ElementType, JSX, ReactNode } from 'react'
import { cloneElement, createElement, isValidElement, useMemo } from 'react'
import type {
  BaseComponentProps,
  ClassNameResolver,
  DataAttributes,
  Renderer,
  StyleResolver,
} from './types.ts'
import { useMergeRefs } from './use-merge-refs.ts'
import {
  isFunction,
  isUndefined,
  resolveClassName,
  resolveStyle,
} from './utils.ts'

// This type is to be used by components for their external public props
export type ComponentProps<T extends ElementType, S> = BaseComponentProps<T> & {
  children?: ((state: S) => ReactNode) | ReactNode
  className?: ClassNameResolver<S>
  style?: StyleResolver<S>
  render?: Renderer<T, S> | JSX.Element
}

export interface UseRenderOptions<T extends ElementType, S> {
  defaultProps?: React.ComponentProps<T> & DataAttributes
  props?: ComponentProps<T, S> & DataAttributes
  ref?: React.Ref<any> | (React.Ref<any> | undefined)[]
  state: S
}

/**
 * Hook for enabling a render prop in custom components. Designed to be used by component libraries as an implementation detail
 * in providing a way to override a component's default rendered element.
 */
export function useRender<T extends ElementType, S>(
  tag: T,
  options: UseRenderOptions<T, S>,
): JSX.Element {
  const { defaultProps, props = {}, ref: optionsRef, state } = options

  const defaultClassName = defaultProps?.className as string | undefined
  const defaultStyle = defaultProps?.style as CSSProperties | undefined
  const defaultChildren = defaultProps?.children as ReactNode

  const {
    children,
    className: propsClassName,
    style: propsStyle,
    ref: propsRef,
    render,
    ...restProps
  } = defaultProps
    ? { ...defaultProps, ...props }
    : (props as ComponentProps<T, S>)

  const resolvedClassName = resolveClassName(
    defaultClassName,
    propsClassName,
    state,
  )
  const resolvedStyle = resolveStyle(defaultStyle, propsStyle, state)

  const refs = useMemo(() => {
    const refsArr = Array.isArray(optionsRef) ? optionsRef : [optionsRef]
    if (propsRef) {
      refsArr.push(propsRef)
    }
    return refsArr
  }, [optionsRef, propsRef])

  const mergedRef = useMergeRefs(refs)

  const resolvedProps = {
    ...restProps,
    ...(!isUndefined(resolvedClassName) && { className: resolvedClassName }),
    ...(!isUndefined(resolvedStyle) && { style: resolvedStyle }),
    ...(mergedRef !== null && { ref: mergedRef }),
  } as React.ComponentProps<T>

  const resolvedChildren = isFunction(children) ? children(state) : children

  if (isValidElement(render)) {
    return cloneElement(
      render,
      resolvedProps,
      resolvedChildren ?? defaultChildren,
    )
  }

  if (isFunction(render)) {
    return render(state, {
      ...resolvedProps,
      children: resolvedChildren,
    }) as JSX.Element
  }

  return createElement(tag, resolvedProps, resolvedChildren ?? defaultChildren)
}
