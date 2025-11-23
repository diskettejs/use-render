import type {
  ComponentProps,
  CSSProperties,
  ElementType,
  ReactNode,
} from 'react'

export type ClassNameResolver<State> =
  | ((
      state: State,
      defaultClassName?: string | undefined,
    ) => string | undefined)
  | string
  | undefined

export type StyleResolver<State> =
  | ((
      state: State,
      defaultStyle?: CSSProperties | undefined,
    ) => CSSProperties | undefined)
  | CSSProperties
  | undefined

export type Renderer<T extends ElementType, S> = (
  state: S,
  props: ComponentProps<T>,
) => ReactNode

export type DataAttributes = Record<`data-${string}`, string | number | boolean>

export type BaseComponentProps<T extends ElementType> = Omit<
  ComponentProps<T>,
  'children' | 'className' | 'style'
>
