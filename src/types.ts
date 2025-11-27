import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  JSX,
  ReactNode,
  Ref,
} from 'react'

export type ClassName<State> =
  | ((state: State, baseClassName?: string) => string | undefined)
  | string

export type Style<State> =
  | ((state: State, baseStyle?: CSSProperties) => CSSProperties | undefined)
  | CSSProperties

export type ComponentRenderer<S> = (
  props: HTMLAttributes<any> & { ref?: Ref<any> | undefined },
  state: S,
) => ReactNode

export type DataAttributes = Record<`data-${string}`, string | number | boolean>

export type BaseComponentProps<T extends ElementType> = Omit<
  ComponentPropsWithRef<T>,
  'children' | 'className' | 'style'
>

// This type is to be used by components for their external public props
export type ComponentProps<T extends ElementType, S> = BaseComponentProps<T> & {
  children?:
    | ReactNode
    | { bivarianceHack(state: S): ReactNode }['bivarianceHack']
    | undefined
  className?: ClassName<S> | undefined
  style?: Style<S> | undefined
  render?: ComponentRenderer<S> | JSX.Element
}
