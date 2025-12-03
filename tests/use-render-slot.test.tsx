import React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import type { SlotProps } from '../src/use-render-slot.ts'
import { useRenderSlot } from '../src/use-render-slot.ts'

function createCard(defaultProps?: React.ComponentProps<'div'>) {
  return function Card(props: SlotProps<'div'>) {
    return useRenderSlot('div', {
      props,
      baseProps: {
        'data-testid': 'card',
        ...defaultProps,
      },
    })
  }
}

describe('useRenderSlot', () => {
  describe('className', () => {
    test('renders with static string className', async () => {
      const Card = createCard()
      const { getByTestId } = await render(
        <Card className="card-primary">Content</Card>,
      )
      const card = getByTestId('card')
      await expect.element(card).toHaveClass('card-primary')
    })

    test('merges props className with baseProps className', async () => {
      const Card = createCard({ className: 'card-base' })
      const { getByTestId } = await render(
        <Card className="card-primary">Content</Card>,
      )
      const card = getByTestId('card')
      await expect.element(card).toHaveClass('card-base')
      await expect.element(card).toHaveClass('card-primary')
    })
  })

  describe('style', () => {
    test('renders with static style object', async () => {
      const Card = createCard()
      const { getByTestId } = await render(
        <Card style={{ backgroundColor: 'red' }}>Content</Card>,
      )
      const card = getByTestId('card')
      await expect.element(card).toHaveStyle({ backgroundColor: 'red' })
    })

    test('merges props style with baseProps style', async () => {
      const Card = createCard({
        style: { padding: '10px', margin: '5px' },
      })
      const { getByTestId } = await render(
        <Card style={{ padding: '20px', color: 'red' }}>Content</Card>,
      )
      const card = getByTestId('card')
      await expect.element(card).toHaveStyle({
        padding: '20px',
        margin: '5px',
        color: 'red',
      })
    })
  })

  describe('children', () => {
    test('renders static children', async () => {
      const Card = createCard()
      const { getByTestId } = await render(<Card>Static Text</Card>)
      const card = getByTestId('card')
      await expect.element(card).toHaveTextContent('Static Text')
    })

    test('uses baseProps children when no children provided', async () => {
      const Card = createCard({ children: 'Default Text' })
      const { getByTestId } = await render(<Card />)
      const card = getByTestId('card')
      await expect.element(card).toHaveTextContent('Default Text')
    })
  })

  describe('render', () => {
    test('renders element from render prop instead of default tag', async () => {
      const Card = createCard()
      const { getByRole } = await render(
        <Card render={<a href="/path" />}>Link</Card>,
      )
      const link = getByRole('link')
      await expect.element(link).toHaveTextContent('Link')
      await expect.element(link).toHaveAttribute('href', '/path')
    })

    test('render function receives props', async () => {
      const Card = createCard()
      const { getByRole } = await render(
        <Card
          className="custom"
          render={(props) => <a {...props} href="/path" />}
        >
          Link
        </Card>,
      )
      const link = getByRole('link')
      await expect.element(link).toHaveTextContent('Link')
      await expect.element(link).toHaveAttribute('href', '/path')
      await expect.element(link).toHaveClass('custom')
    })

    test('element render prop preserves children', async () => {
      const Card = createCard()
      const { getByRole } = await render(
        <Card render={<section role="region" />}>
          <span>Inner content</span>
        </Card>,
      )
      const section = getByRole('region')
      await expect.element(section).toHaveTextContent('Inner content')
    })
  })

  describe('event handler composition', () => {
    test('composes event handlers - both run, user first then default', async () => {
      const callOrder: string[] = []
      const defaultHandler = vi.fn(() => callOrder.push('default'))
      const userHandler = vi.fn(() => callOrder.push('user'))

      const Card = createCard({ onMouseEnter: defaultHandler })
      const { getByTestId } = await render(
        <Card onMouseEnter={userHandler}>Content</Card>,
      )
      const card = getByTestId('card')

      await card.hover()

      expect(defaultHandler).toHaveBeenCalledTimes(1)
      expect(userHandler).toHaveBeenCalledTimes(1)
      expect(callOrder).toEqual(['user', 'default'])
    })

    test('only default handler runs when no user handler provided', async () => {
      const defaultHandler = vi.fn()
      const Card = createCard({ onMouseEnter: defaultHandler })
      const { getByTestId } = await render(<Card>Content</Card>)
      const card = getByTestId('card')

      await card.hover()

      expect(defaultHandler).toHaveBeenCalledTimes(1)
    })

    test('only user handler runs when no default handler', async () => {
      const userHandler = vi.fn()
      const Card = createCard()
      const { getByTestId } = await render(
        <Card onMouseEnter={userHandler}>Content</Card>,
      )
      const card = getByTestId('card')

      await card.hover()

      expect(userHandler).toHaveBeenCalledTimes(1)
    })
  })
})
