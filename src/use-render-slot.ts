import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  JSX,
  ReactNode,
  Ref,
} from 'react'
import { cloneElement, createElement, isValidElement } from 'react'
import type { DataAttributes } from './types.ts'
import { useComposedRef } from './use-composed-ref.ts'
import { cx, isFunction, isString, mergeProps } from './utils.ts'

export type SlotRenderer = (
  props: HTMLAttributes<any> & { ref?: Ref<any> | undefined },
) => ReactNode

export type SlotProps<T extends ElementType> = Omit<
  ComponentPropsWithRef<T>,
  'className' | 'style'
> & {
  className?: string | undefined
  style?: CSSProperties | undefined
  render?: SlotRenderer | JSX.Element
}

export interface UseRenderSlotOptions<T extends ElementType> {
  baseProps?: React.ComponentProps<T> & DataAttributes
  props?: SlotProps<T> & DataAttributes
  ref?: Ref<any> | (Ref<any> | undefined)[]
}

/**
 * Hook for rendering slot elements with render prop support and prop merging.
 * A simpler version of useRender for stateless components.
 *
 * @example
 * ```tsx
 * import { useRenderSlot, SlotProps } from '@diskette/use-render'
 *
 * type CardProps = SlotProps<'div'>
 *
 * function Card(props: CardProps) {
 *   return useRenderSlot('div', {
 *     props,
 *     baseProps: { className: 'card' },
 *   })
 * }
 *
 * // Usage:
 * <Card className="card-primary" />
 * <Card render={<section />} />
 * <Card render={(props) => <article {...props} />} />
 * ```
 */
export function useRenderSlot<T extends ElementType>(
  tag: T,
  options: UseRenderSlotOptions<T> = {},
): ReactNode {
  const baseProps: React.ComponentProps<'div'> = options.baseProps ?? {}
  const props = (options.props ?? {}) as SlotProps<'div'>

  const {
    className: baseClassName,
    style: baseStyle,
    children: baseChildren,
    ...base
  } = baseProps
  const { className, style, children, ref, render, ...rest } = props

  const resolvedClassName = cx(baseClassName, className)
  const resolvedStyle =
    baseStyle || style ? { ...baseStyle, ...style } : undefined

  const mergedRef = useComposedRef(ref, options.ref)

  const resolvedProps: React.ComponentProps<'div'> = {
    ...mergeProps(base, rest),
    ref: mergedRef,
  }
  if (isString(resolvedClassName)) {
    resolvedProps.className = resolvedClassName
  }
  if (typeof resolvedStyle === 'object') {
    resolvedProps.style = resolvedStyle
  }

  const resolvedChildren = children ?? baseChildren

  // For `<Component render={<a />} />`
  if (isValidElement(render)) {
    return cloneElement(render, resolvedProps, resolvedChildren)
  }

  // For `<Component render={(props) => <a {...props} />)} />`
  if (isFunction(render)) {
    return render({ ...resolvedProps, children: resolvedChildren })
  }

  return createElement(tag, resolvedProps, resolvedChildren)
}
