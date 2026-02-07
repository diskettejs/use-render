import React, { Fragment } from 'react'
import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import type { ContainerProps } from '../src/use-render-container.ts'
import { useRenderContainer } from '../src/use-render-container.ts'

type ContainerState = { itemCount: number }
type ItemState = ContainerState & { index: number; value: string }

function createList(
  items: string[],
  defaultProps?: React.ComponentProps<'ul'>,
) {
  return function List(props: ContainerProps<'ul', ContainerState, ItemState>) {
    const state: ContainerState = { itemCount: items.length }

    const { Container, renderItem } = useRenderContainer('ul', state, {
      props,
      baseProps: {
        ...defaultProps,
        children: (itemState) => <li data-default-item>{itemState.value}</li>,
      },
    })

    return (
      <Container>
        {items.map((value, index) => (
          <Fragment key={index}>
            {renderItem({ ...state, index, value })}
          </Fragment>
        ))}
      </Container>
    )
  }
}

describe('useRenderContainer', () => {
  test('renders container with items using default children', async () => {
    const items = ['Apple', 'Banana', 'Cherry']
    const List = createList(items)
    const { getByRole, getByText } = await render(<List />)

    await expect.element(getByRole('list')).toBeInTheDocument()

    for (const item of items) {
      await expect.element(getByText(item)).toBeInTheDocument()
    }
  })

  test('consumer can override children to customize item rendering', async () => {
    const items = ['Apple', 'Banana']
    const List = createList(items)
    const { getByText, getByRole } = await render(
      <List
        style={({ itemCount }) => ({ color: itemCount === 2 ? 'red' : 'blue' })}
      >
        {(itemState) => (
          <div role="listitem">
            {itemState.index + 1}. {itemState.value}
          </div>
        )}
      </List>,
    )

    const apple = getByRole('listitem').filter({ hasText: '1. Apple' })
    await expect.element(apple).toBeInTheDocument()
    await expect.element(apple).toHaveStyle({ color: 'red' })
    await expect
      .element(getByRole('listitem').filter({ hasText: '2. Banana' }))
      .toBeInTheDocument()
  })

  test('consumer can replace container element via render prop', async () => {
    const items = ['Apple']
    const List = createList(items)
    const { getByRole } = await render(<List render={<ol />} />)

    const list = getByRole('list').element()
    expect(list.tagName).toBe('OL')
  })

  test('container className resolves with container state', async () => {
    const items = ['A', 'B', 'C']
    const List = createList(items)
    const { getByRole } = await render(
      <List className={(state) => (state.itemCount > 2 ? 'many' : 'few')} />,
    )

    await expect.element(getByRole('list')).toHaveClass('many')
  })

  describe('element render prop merging', () => {
    test('element render prop merges its own className with resolved className', async () => {
      const items = ['Apple']
      const List = createList(items, { className: 'base' })
      const { getByRole } = await render(
        <List className="consumer" render={<ol className="render-el" />} />,
      )
      const list = getByRole('list')
      await expect.element(list).toHaveClass('render-el')
      await expect.element(list).toHaveClass('base')
      await expect.element(list).toHaveClass('consumer')
    })

    test('element render prop merges style with resolved style winning on conflict', async () => {
      const items = ['Apple']
      const List = createList(items, { style: { padding: '10px' } })
      const { getByRole } = await render(
        <List
          style={{ padding: '20px', color: 'red' }}
          render={<ol style={{ padding: '5px', fontWeight: 'bold' }} />}
        />,
      )
      const list = getByRole('list')
      await expect.element(list).toHaveStyle({
        padding: '20px',
        fontWeight: 'bold',
        color: 'red',
      })
    })

    test('element render prop composes event handlers from all sources', async () => {
      const callOrder: string[] = []
      const items = ['Apple']
      const List = createList(items, {
        onMouseEnter: () => callOrder.push('base'),
      })
      const { getByRole } = await render(
        <List
          onMouseEnter={() => callOrder.push('consumer')}
          render={<ol onMouseEnter={() => callOrder.push('render-el')} />}
        />,
      )
      const list = getByRole('list')
      await list.hover()
      expect(callOrder).toEqual(['consumer', 'base', 'render-el'])
    })
  })
})
