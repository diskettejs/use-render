import type {
  ComponentProps,
  ComponentPropsWithRef,
  ElementType,
  JSX,
  ReactNode,
} from 'react'
import { cloneElement, createElement, isValidElement } from 'react'
import type { DataAttributes } from '../types.ts'
import { cx, isFunction, isString, mergeProps } from '../utils.ts'

export type SlotRenderer<T extends ElementType> = (
  props: ComponentPropsWithRef<T>,
) => ReactNode

export type SlotProps<T extends ElementType> = ComponentPropsWithRef<T> & {
  render?: SlotRenderer<T> | JSX.Element
}

export interface RenderSlotOptions<T extends ElementType> {
  baseProps?: ComponentProps<T> & DataAttributes
  props?: SlotProps<T> & DataAttributes
}

/**
 * Pure function for rendering slot elements with render prop support and prop merging.
 * RSC-compatible version of useRenderSlot without ref handling.
 *
 * @example
 * ```tsx
 * import { renderSlot, SlotProps } from '@diskette/use-render/fns'
 *
 * type CardProps = SlotProps<'div'>
 *
 * function Card(props: CardProps) {
 *   return renderSlot('div', {
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
export function renderSlot<T extends ElementType>(
  tag: T,
  options: RenderSlotOptions<T> = {},
): ReactNode {
  const baseProps = (options.baseProps ?? {}) as ComponentProps<'div'>
  const props = (options.props ?? {}) as SlotProps<'div'>

  const {
    className: baseClassName,
    style: baseStyle,
    children: baseChildren,
    ...base
  } = baseProps
  const { className, style, children, render, ...rest } = props

  const resolvedClassName = cx(baseClassName, className)
  const resolvedStyle =
    baseStyle || style ? { ...baseStyle, ...style } : undefined

  const resolvedProps: ComponentProps<'div'> = {
    ...mergeProps(base, rest),
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
