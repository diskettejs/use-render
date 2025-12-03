import type { CSSProperties, ElementType, JSX, ReactNode, Ref } from 'react'
import {
  cloneElement,
  createElement,
  isValidElement,
  useCallback,
  useMemo,
} from 'react'
import type {
  BaseComponentProps,
  ClassName,
  ComponentRenderer,
  DataAttributes,
  Style,
} from './types.ts'
import { useComposedRef } from './use-composed-ref.ts'
import {
  isFunction,
  isString,
  mergeProps,
  resolveClassName,
  resolveStyle,
} from './utils.ts'

type Children<S> = ((state: S) => ReactNode) | ReactNode

/**
 * Props for the container element.
 * - className/style resolve with ContainerState
 * - children resolves with ItemState (per-item rendering)
 * - render prop swaps the container element
 */
export type ContainerProps<
  T extends ElementType,
  ContainerState,
  ItemState = ContainerState,
> = BaseComponentProps<T> & {
  className?: ClassName<ContainerState> | undefined
  style?: Style<ContainerState> | undefined
  children?: Children<ItemState> | undefined
  render?: ComponentRenderer<ContainerState> | JSX.Element
}

/**
 * Base props for the container with defaults.
 * - className/style are static (no state resolution)
 * - children can be a function of ItemState for default item rendering
 */
export type ContainerBaseProps<T extends ElementType, ItemState> = Omit<
  React.ComponentProps<T>,
  'children' | 'className' | 'style'
> &
  DataAttributes & {
    className?: string | undefined
    style?: CSSProperties | undefined
    children?: Children<ItemState> | undefined
  }

export interface UseRenderContainerOptions<
  T extends ElementType,
  ContainerState,
  ItemState,
> {
  props?: ContainerProps<T, ContainerState, ItemState> & DataAttributes
  baseProps?: ContainerBaseProps<T, ItemState>
  ref?: Ref<any> | (Ref<any> | undefined)[]
}

export interface UseRenderContainerResult<T extends ElementType, ItemState> {
  /** Renders the container element with resolved props */
  Container: (props: { children?: ReactNode }) => ReactNode
  /** Resolves children with item-specific state */
  renderItem: (itemState: ItemState) => ReactNode
  /** Direct access to resolved container props */
  containerProps: React.ComponentProps<T>
}

/**
 * Hook for rendering container elements with item-level render control.
 *
 * Combines the prop resolution of useRender with the render control of useRenderProps.
 * - Container: handles className/style resolution, ref composition, and render prop
 * - renderItem: resolves children function with per-item state
 *
 * @example
 * ```tsx
 * type ContainerState = { locale: string }
 * type ItemState = ContainerState & { date: Date; index: number }
 *
 * function DateList(props: ContainerProps<'div', ContainerState, ItemState>) {
 *   const { Container, renderItem } = useRenderContainer('div', { locale: 'en' }, {
 *     props,
 *     baseProps: {
 *       role: 'list',
 *       children: (state) => <DateItem date={state.date} />,
 *     },
 *   })
 *   const dates = generateDates()
 *
 *   return (
 *     <Container>
 *       {dates.map((date, index) => (
 *         <ItemContext key={date.toString()}>
 *           {renderItem({ date, index, locale: 'en' })}
 *         </ItemContext>
 *       ))}
 *     </Container>
 *   )
 * }
 *
 * // Consumer usage:
 * <DateList className={(state) => state.locale === 'en' && 'ltr'} />
 * <DateList render={<section />} />
 * <DateList>{(state) => <CustomDateItem date={state.date} />}</DateList>
 * ```
 */
// TODO: refactor args order, useRenderContainer('div', props, options). `props` is what defines what the interface is for the state
export function useRenderContainer<
  T extends ElementType,
  ContainerState,
  ItemState = ContainerState,
>(
  tag: T,
  containerState: ContainerState,
  options: UseRenderContainerOptions<T, ContainerState, ItemState> = {},
): UseRenderContainerResult<T, ItemState> {
  // Workaround for getting the prop objects to be typed. Should still be ok as the properties we need are common to all elements
  const baseProps = (options.baseProps ?? {}) as ContainerBaseProps<
    'div',
    ItemState
  >
  const props = (options.props ?? {}) as ContainerProps<
    'div',
    ContainerState,
    ItemState
  >

  const {
    className: baseClassName,
    style: baseStyle,
    children: baseChildren,
    ...base
  } = baseProps

  const { className, style, children, ref, render, ...rest } = props

  // Resolve container className/style with container state
  const resolvedClassName = resolveClassName(
    containerState,
    baseClassName,
    className,
  )
  const resolvedStyle = resolveStyle(containerState, baseStyle, style)

  // Compose refs
  const mergedRef = useComposedRef(ref, options.ref)

  // Build resolved container props (memoized for stable useCallback reference)
  const resolvedProps = useMemo(() => {
    const props: React.ComponentProps<'div'> = {
      ...mergeProps(base, rest),
      ref: mergedRef,
    }
    if (isString(resolvedClassName)) {
      props.className = resolvedClassName
    }
    if (typeof resolvedStyle === 'object') {
      props.style = resolvedStyle
    }
    return props
  }, [base, rest, mergedRef, resolvedClassName, resolvedStyle])

  // Container component that handles render prop
  const Container = useCallback(
    ({ children: containerChildren }: { children?: ReactNode }): ReactNode => {
      const propsWithChildren = {
        ...resolvedProps,
        children: containerChildren,
      }

      // For `<Component render={<section />} />`
      if (isValidElement(render)) {
        return cloneElement(render, propsWithChildren)
      }

      // For `<Component render={(props, state) => <section {...props} />} />`
      if (isFunction(render)) {
        return render(propsWithChildren, containerState)
      }

      return createElement(tag, propsWithChildren)
    },
    [resolvedProps, render, containerState, tag],
  )

  // Render function for items - resolves children with item state
  const renderItem = useCallback(
    (itemState: ItemState): ReactNode => {
      // Props children take precedence over base children
      const childrenToRender = children !== undefined ? children : baseChildren
      return isFunction(childrenToRender)
        ? childrenToRender(itemState)
        : childrenToRender
    },
    [children, baseChildren],
  )

  return {
    Container,
    renderItem,
    containerProps: resolvedProps as React.ComponentProps<T>,
  }
}
