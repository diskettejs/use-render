import type { ElementType, ReactNode, Ref } from 'react'
import type { RenderSlotOptions } from './fns/render-slot.ts'
import { renderSlot } from './fns/render-slot.ts'
import { useComposedRef } from './use-composed-ref.ts'

export type { SlotProps, SlotRenderer } from './fns/render-slot.ts'

export interface UseRenderSlotOptions<
  T extends ElementType,
> extends RenderSlotOptions<T> {
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
  const mergedRef = useComposedRef(options.props?.ref, options.ref)
  const renderOptions: RenderSlotOptions<T> = {}

  if (options.props) {
    renderOptions.props = { ...options.props, ref: mergedRef }
  }
  if (options.baseProps) {
    renderOptions.baseProps = options.baseProps
  }

  return renderSlot(tag, renderOptions)
}
