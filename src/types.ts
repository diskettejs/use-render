import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from 'react'

export type ClassNameResolver<State> =
  | ((state: State, defaultClassName?: string) => string | undefined)
  | string
  | undefined

export type StyleResolver<State> =
  | ((state: State, defaultStyle?: CSSProperties) => CSSProperties | undefined)
  | CSSProperties
  | undefined

export type Renderer<S> = (
  state: S,
  props: React.HTMLAttributes<any> & { ref?: React.Ref<any> | undefined },
) => ReactNode

export type DataAttributes = Record<`data-${string}`, string | number | boolean>

export type BaseComponentProps<T extends ElementType> = Omit<
  ComponentPropsWithRef<T>,
  'children' | 'className' | 'style'
>
