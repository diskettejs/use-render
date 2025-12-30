# useRender

React hooks for building components with render prop composition and type-safe state-driven styling.

```bash
pnpm add @diskette/use-render
```

## Overview

When building component libraries, you often need to let consumers customize rendering to:

- swap the underlying element
- access internal state for styling
- compose refs and event handlers.

These hooks handle that plumbing:

- **Component authors** get prop merging, ref composition, and render prop support out of the box
- **Consumers** get type-safe APIs where `className`, `style`, and `children` can be functions of component state

## `useRender` — Stateful Components

For components that expose internal state to consumers. The state flows through `className`, `style`, `children`, and `render` as callback parameters.

**Component author:**

```tsx
import { useRender, ComponentProps } from '@diskette/use-render'

type State = { disabled: boolean; loading: boolean }
type ButtonProps = ComponentProps<'button', State>

function Button(props: ButtonProps) {
  const state: State = { disabled: props.disabled ?? false, loading: false }
  return useRender('button', state, { props })
}
```

## `useRenderSlot` — Stateless Slots

For wrapper components that don't expose internal state. Consumers can still swap the element or pass props—they just won't get state callbacks.

**Component author:**

```tsx
import { useRenderSlot, SlotProps } from '@diskette/use-render'

type CardProps = SlotProps<'div'>

function Card(props: CardProps) {
  return useRenderSlot('div', { props, baseProps: { className: 'card' } })
}
```

**Consumer:**

```tsx
<Card className="card-primary">Content</Card>
<Card render={<section />}>Content</Card>
<Card render={(props) => <article {...props} />}>Content</Card>
```

Props merge automatically—`className` and `style` combine, refs compose, event handlers chain (consumer runs first). The `render` prop receives only `props` since there's no state to pass.

**Consumer:**

```tsx
// State-driven className
<Button className={(state) => state.disabled ? 'opacity-50' : undefined} />

// State-driven className with access to base className
<Button className={(state, base) => `${base} ${state.disabled ? 'opacity-50' : ''}`} />

// State-driven style
<Button style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })} />

// State-driven style with access to base style
<Button style={(state, base) => ({ ...base, opacity: state.disabled ? 0.5 : 1 })} />

// State-driven children
<Button>{(state) => state.loading ? 'Loading...' : 'Submit'}</Button>

// Render prop with state access
<Button render={(props, state) => <a {...props} aria-busy={state.loading} />} />
```

The `render` callback receives `(props, state)` for full control over both props and rendering.

## `useRenderContainer` — Containers with Items

For list-like components with two levels of state: container-level (e.g., item count) and item-level (e.g., index, value). The `className` and `style` callbacks receive container state, while `children` receives item state.

**Component author:**

```tsx
import { useRenderContainer, ContainerProps } from '@diskette/use-render'

type ContainerState = { count: number }
type ItemState = { index: number; value: string }
type ListProps = ContainerProps<'ul', ContainerState, ItemState>

function List({ items, ...props }: ListProps & { items: string[] }) {
  const { Container, renderItem, containerProps } = useRenderContainer(
    'ul',
    { count: items.length },
    { props, baseProps: { children: (item) => <li>{item.value}</li> } },
  )
  // containerProps provides direct access to resolved props if needed
  return (
    <Container>
      {items.map((v, i) => renderItem({ index: i, value: v }))}
    </Container>
  )
}
```

**Consumer:**

```tsx
// Container className receives ContainerState
<List items={data} className={(state) => state.count > 5 ? 'scrollable' : undefined} />

// Children function receives ItemState
<List items={data}>{(item) => <li>{item.index + 1}. {item.value}</li>}</List>

// Swap container element
<List items={data} render={<ol />} />
```

## Props Types

Each hook has a corresponding type for your component's public API:

| Hook                 | Props Type                  | State            |
| -------------------- | --------------------------- | ---------------- |
| `useRenderSlot`      | `SlotProps<T>`              | None             |
| `useRender`          | `ComponentProps<T, S>`      | Single state     |
| `useRenderContainer` | `ContainerProps<T, CS, IS>` | Container + Item |

These extend the element's native props, adding `render` and (for stateful hooks) function forms of `className`, `style`, and `children`.

## What the Hooks Handle

- **Render prop** — swap the element via `render={<a />}` or `render={(props) => ...}`
- **Ref composition** — refs from consumer, base props, and options are merged
- **Event handler chaining** — consumer handlers run first, then base handlers
- **className/style merging** — static values combine; functions receive state and the resolved base value as parameters

## Ref Composition

Component libraries often need internal ref access for focus management, measurements, or imperative APIs—while still letting consumers attach their own refs. The hooks handle this automatically.

**Component author:**

```tsx
import { useRef, useImperativeHandle } from 'react'
import { useRender, ComponentProps } from '@diskette/use-render'

type State = { open: boolean }
type ComboboxProps = ComponentProps<'input', State>

export interface ComboboxRef {
  focus: () => void
  clear: () => void
}

function Combobox({
  ref,
  ...props
}: ComboboxProps & { ref?: React.Ref<ComboboxRef> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const state: State = { open: false }

  // Expose imperative API to consumers
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = ''
    },
  }))

  // Internal ref composes with any ref passed through props
  return useRender('input', state, { props, ref: inputRef })
}
```

**Consumer:**

```tsx
const inputRef = useRef<HTMLInputElement>(null)
const comboboxRef = useRef<ComboboxRef>(null)

// Direct element access
<Combobox ref={inputRef} />

// Imperative handle access
<Combobox ref={comboboxRef} />
comboboxRef.current?.focus()
```

The `options.ref` parameter accepts a single ref or an array of refs. All refs—from `options.ref`, `baseProps.ref`, and consumer `props.ref`—are composed into a single callback ref that updates all sources and handles cleanup.
