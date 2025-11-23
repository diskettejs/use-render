import type { ElementType, JSX, ReactNode } from 'react'
import { cloneElement, createElement, isValidElement } from 'react'
import type {
  BaseComponentProps,
  ClassNameResolver,
  DataAttributes,
  Renderer,
  StyleResolver,
} from './types.ts'
import { useComposedRef } from './use-composed-ref.ts'
import {
  isFunction,
  isString,
  mergeProps,
  resolveClassName,
  resolveStyle,
} from './utils.ts'

// This type is to be used by components for their external public props
export type ComponentProps<T extends ElementType, S> = BaseComponentProps<T> & {
  children?: ((state: S) => ReactNode) | ReactNode
  className?: ClassNameResolver<S>
  style?: StyleResolver<S>
  render?: Renderer<S> | JSX.Element
}

export interface UseRenderOptions<T extends ElementType, S> {
  defaultProps?: React.ComponentProps<T> & DataAttributes
  props?: ComponentProps<T, S> & DataAttributes
  ref?: React.Ref<any> | (React.Ref<any> | undefined)[]
}

/**
 * Hook for enabling a render prop in custom components. Designed to be used by component libraries as an implementation detail
 * in providing a way to override a component's default rendered element.
 */
export function useRender<T extends ElementType, S>(
  tag: T,
  state: S,
  options: UseRenderOptions<T, S>,
): ReactNode {
  // Workarounds for getting the prop objects to be typed. But should still be ok as the properties we need is common to all elements
  const defaultProps: React.ComponentProps<'div'> = options.defaultProps ?? {}
  const props = (options.props ?? {}) as ComponentProps<'div', S>

  const {
    className: defaultClassName,
    style: defaultStyle,
    children: defaultChildren,
    ...defaults
  } = defaultProps
  const { className, style, children, ref, render, ...rest } = props ?? {}

  const resolvedClassName = resolveClassName(defaultClassName, className, state)
  const resolvedStyle = resolveStyle(defaultStyle, style, state)

  const refs: Array<React.Ref<any> | undefined> = Array.isArray(options.ref)
    ? [ref, ...options.ref]
    : [ref, options.ref]

  const mergedRef = useComposedRef(refs)

  // Another workaround for getting component props typed
  const resolvedProps: React.ComponentProps<'div'> = {
    ...mergeProps(defaults, rest),
    ref: mergedRef,
  }
  if (isString(resolvedClassName)) {
    resolvedProps.className = resolvedClassName
  }
  if (typeof resolvedStyle === 'object') {
    resolvedProps.style = resolvedStyle
  }

  const resolvedChildren = isFunction(children) ? children(state) : children

  // For `<Component render={<a />} />`
  if (isValidElement(render)) {
    return cloneElement(render, resolvedProps, resolvedChildren)
  }

  // For `<Component render={(state, props) => <a {...props} />)} />`
  if (isFunction(render)) {
    return render(state, {
      ...resolvedProps,
      children: resolvedChildren,
    })
  }

  return createElement(tag, resolvedProps, resolvedChildren ?? defaultChildren)
}
