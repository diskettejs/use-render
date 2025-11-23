# useRender

A React hook for component libraries that enables flexible render prop patterns, allowing consumers to override a component's default rendered element while maintaining proper `ref`, `className`, and `style` merging.

## Installation

```bash
pnpm add @diskette/use-render
```

## Features

- **Render prop support** - Override elements via `render` prop (element or function)
- **State-aware className** - Resolve classNames dynamically based on component state
- **State-aware style** - Resolve styles dynamically based on component state
- **Automatic ref merging** - Combines multiple refs seamlessly
- **Children as render function** - Pass children as a function receiving state

## Usage

### Building a Component

Use `useRender` inside your component to enable the render prop pattern:

```tsx
import { useRender, type ComponentProps } from '@diskette/use-render'

interface ButtonState {
  isPressed: boolean
  isHovered: boolean
}

type ButtonProps = ComponentProps<'button', ButtonState>

function Button(props: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const state: ButtonState = { isPressed, isHovered }

  return useRender('button', state, {
    baseProps: {
      className: 'btn',
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
    props,
  })
}
```

### Consuming the Component

#### Default Usage

```tsx
<Button className="primary">Click me</Button>
```

#### Override with Element

```tsx
<Button render={<a href="/path" />}>Link styled as button</Button>
```

#### Override with Function

```tsx
<Button
  render={(props, state) => (
    <a {...props} href="/path" data-pressed={state.isPressed} />
  )}
>
  Link with state access
</Button>
```

### State-Aware className

Pass a function to resolve className based on component state:

```tsx
<Button
  className={(state, baseClassName) =>
    `${baseClassName} ${state.isPressed ? 'pressed' : ''}`
  }
>
  Press me
</Button>
```

Or pass a string to merge with the default className (uses `clsx`):

```tsx
<Button className="primary large">Click me</Button>
```

### State-Aware style

Pass a function to resolve styles based on component state:

```tsx
<Button
  style={(state) => ({
    backgroundColor: state.isPressed ? 'darkblue' : 'blue',
    transform: state.isPressed ? 'scale(0.98)' : undefined,
  })}
>
  Press me
</Button>
```

### Children as Render Function

Access state in children:

```tsx
<Button>{(state) => (state.isPressed ? 'Pressing...' : 'Click me')}</Button>
```

## API

### `useRender(tag, options)`

```ts
function useRender<T extends ElementType, S>(
  tag: T,
  state,
  options: UseRenderOptions<T, S>,
): ReactNode
```

#### Parameters

- `tag` - The default element type to render (e.g., `'button'`, `'div'`)
- `options` - Configuration object

#### Options

```ts
interface UseRenderOptions<T extends ElementType, S> {
  baseProps?: React.ComponentProps<T>
  props?: ComponentProps<T, S>
  ref?: React.Ref<any> | (React.Ref<any> | undefined)[]
}
```

| Option      | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| `baseProps` | Base props applied to the element                                  |
| `props`     | Consumer-provided props (typically forwarded from component props) |
| `ref`       | Ref(s) to merge with the consumer's ref                            |

### `ComponentProps<T, S>`

Type for component's external public props. Components using `useRender` should use this type (or extend from it) instead of `React.ComponentProps`. It's essentially `React.ComponentProps<T>` augmented with state-aware `className`, `style`, `children`, and the `render` prop:

```ts
type ComponentProps<T extends ElementType, S> = BaseComponentProps<T> & {
  children?: ((state: S) => ReactNode) | ReactNode
  className?: ClassNameResolver<S>
  style?: StyleResolver<S>
  render?: Renderer<T, S> | JSX.Element
}
```

### `ClassNameResolver<S>`

```ts
type ClassNameResolver<S> =
  | ((state: S, baseClassName?: string) => string | undefined)
  | string
  | undefined
```

### `StyleResolver<S>`

```ts
type StyleResolver<S> =
  | ((state: S, baseStyle?: CSSProperties) => CSSProperties | undefined)
  | CSSProperties
  | undefined
```

### `Renderer<S>`

```ts
type Renderer<S> = (
  props: ComponentPropsWithRef<T>,
  state: S,
) => ReactNode
```

## License

[MIT](./LICENSE) License
