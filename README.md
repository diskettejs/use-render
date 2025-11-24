# useRender

A React hook for component libraries that lets consumers swap the rendered element—like rendering a `<a>` instead of a `<button>`—while keeping all your component's behavior intact. It handles the tricky parts: merging refs, combining props, and letting className and style respond to internal state.

## Installation

```bash
pnpm add @diskette/use-render
```

## Quick Start

Here's a simple button component that consumers can render as any element:

```tsx
import { useRender, type ComponentProps } from '@diskette/use-render'

type ButtonProps = ComponentProps<'button', { isPressed: boolean }>

function Button(props: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  return useRender(
    'button',
    { isPressed },
    {
      baseProps: {
        className: 'btn',
        onMouseDown: () => setIsPressed(true),
        onMouseUp: () => setIsPressed(false),
      },
      props,
    },
  )
}
```

Now consumers can use it normally, or swap the element entirely:

```tsx
// Renders a <button>
<Button className="primary">Click me</Button>

// Renders an <a> with all the button's behavior
<Button render={<a href="/path" />}>Go somewhere</Button>
```

## Usage

### Overriding the `Element`

Pass a JSX element to `render` and it will be cloned with your component's props:

```tsx
<Button render={<a href="/path" />}>Link styled as button</Button>
```

Or pass a function to get full control over rendering, with access to both props and state:

```tsx
<Button
  render={(props, state) => (
    <a {...props} href="/path" data-pressed={state.isPressed} />
  )}
>
  Link with state access
</Button>
```

### State-Aware `className`

Pass a function to compute `className` based on component state. The second argument gives you access to the base `className` set by the component:

```tsx
<Button
  className={(state, baseClassName) =>
    `${baseClassName} ${state.isPressed ? 'pressed' : ''}`
  }
>
  Press me
</Button>
```

Or just pass a string. It will be merged with the default `className`:

```tsx
<Button className="primary large">Click me</Button>
```

### State-Aware style `(CSSProperties)`

Same pattern works for inline styles:

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

Access state by passing a function:

```tsx
<Button>{(state) => (state.isPressed ? 'Pressing...' : 'Click me')}</Button>
```

### `render` vs `children` as Function

You might wonder why both exist—most libraries pick one or the other. They serve different purposes:

- **`render`** swaps the element itself. Use it when you need a `<a>` instead of a `<button>`, or want to integrate with a router's `<Link>`.
- **`children` as function** changes what's inside the element. Use it when the content should react to internal state.

They compose naturally—you can use both at once:

```tsx
<Button render={<a href="/path" />}>
  {(state) => (state.isPressed ? 'Going...' : 'Go somewhere')}
</Button>
```

## API

### `useRender(tag, state, options)`

```ts
function useRender<T extends ElementType, S>(
  tag: T,
  state: S,
  options: UseRenderOptions<T, S>,
): ReactNode
```

| Parameter           | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| `tag`               | Default element type (e.g., `'button'`, `'div'`)                   |
| `state`             | Component state passed to resolvers and render functions           |
| `options.baseProps` | Base props applied to the element (your component's defaults)      |
| `options.props`     | Consumer-provided props (typically forwarded from component props) |
| `options.ref`       | Ref(s) to merge with the consumer's ref                            |

### `ComponentProps<ElementType, State>`

Use this type for your component's public props. It extends `React.ComponentProps<T>` and augments `className`, `style`, and `children` to be state-aware as well as provide the `render` prop:

```ts
type ButtonProps = ComponentProps<'button', ButtonState>
```

## License

[MIT](./LICENSE) License
