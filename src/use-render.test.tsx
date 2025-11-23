import React, { useState } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useRender, type ComponentProps } from './use-render.ts'

type State = { isActive: boolean }
function createBtn(defaultProps?: React.ComponentProps<'button'>) {
  return function Button(props: ComponentProps<'button', State>) {
    const [isActive, setIsActive] = useState(false)
    const state: State = { isActive }

    return useRender('button', state, {
      props,
      baseProps: {
        onClick: () => setIsActive((cur) => !cur),
        ...defaultProps,
      },
    })
  }
}

describe('useRender', () => {
  describe('className', () => {
    test('renders with static string className', async () => {
      const Button = createBtn()
      const { getByRole } = await render(
        <Button className="btn-primary">Click</Button>,
      )
      const button = getByRole('button')
      await expect.element(button).toHaveClass('btn-primary')
    })

    test('className function receives state', async () => {
      const Button = createBtn()
      const { getByRole } = await render(
        <Button className={(state) => (state.isActive ? 'active' : 'inactive')}>
          Click
        </Button>,
      )
      const button = getByRole('button')
      await expect.element(button).toHaveClass('inactive')

      await button.click()
      await expect.element(button).toHaveClass('active')
    })

    test('className function receives baseClassName as second argument', async () => {
      const Button = createBtn({ className: 'btn-default' })
      const { getByRole } = await render(
        <Button
          className={(_state, baseClassName) =>
            `custom ${baseClassName ?? ''}`
          }
        >
          Click
        </Button>,
      )
      const button = getByRole('button')
      await expect.element(button).toHaveClass('custom')
      await expect.element(button).toHaveClass('btn-default')
    })

    test('merges props className with defaultProps className', async () => {
      const Button = createBtn({ className: 'btn-base' })
      const { getByRole } = await render(
        <Button className="btn-primary">Click</Button>,
      )
      const button = getByRole('button')
      await expect.element(button).toHaveClass('btn-base')
      await expect.element(button).toHaveClass('btn-primary')
    })
  })

  describe('style', () => {
    test('renders with static style object', async () => {
      const Button = createBtn()
      const { getByRole } = await render(
        <Button style={{ backgroundColor: 'red' }}>Click</Button>,
      )
      const button = getByRole('button')
      await expect.element(button).toHaveStyle({ backgroundColor: 'red' })
    })

    test('style function receives state', async () => {
      const Button = createBtn()
      const { getByRole } = await render(
        <Button
          style={(state) => ({
            backgroundColor: state.isActive ? 'green' : 'gray',
          })}
        >
          Click
        </Button>,
      )
      const button = getByRole('button')
      await expect.element(button).toHaveStyle({ backgroundColor: 'gray' })

      await button.click()
      await expect.element(button).toHaveStyle({ backgroundColor: 'green' })
    })

    test('style function receives baseStyle as second argument', async () => {
      const Button = createBtn({ style: { padding: '10px' } })
      const { getByRole } = await render(
        <Button
          style={(_state, baseStyle) => ({
            ...baseStyle,
            color: 'blue',
          })}
        >
          Click
        </Button>,
      )
      const button = getByRole('button')
      await expect
        .element(button)
        .toHaveStyle({ padding: '10px', color: 'blue' })
    })

    test('merges props style with defaultProps style', async () => {
      const Button = createBtn({
        style: { padding: '10px', margin: '5px' },
      })
      const { getByRole } = await render(
        <Button style={{ padding: '20px', color: 'red' }}>Click</Button>,
      )
      const button = getByRole('button')
      // Props style should override default where they overlap
      await expect.element(button).toHaveStyle({
        padding: '20px',
        margin: '5px',
        color: 'red',
      })
    })
  })

  describe('children', () => {
    test('renders static children', async () => {
      const Button = createBtn()
      const { getByRole } = await render(<Button>Static Text</Button>)
      const button = getByRole('button')
      await expect.element(button).toHaveTextContent('Static Text')
    })

    test('children function receives state', async () => {
      const Button = createBtn()
      const { getByRole } = await render(
        <Button>{(state) => (state.isActive ? 'Active!' : 'Inactive')}</Button>,
      )
      const button = getByRole('button')
      await expect.element(button).toHaveTextContent('Inactive')

      await button.click()
      await expect.element(button).toHaveTextContent('Active!')
    })

    test('uses defaultProps children when no children provided', async () => {
      const Button = createBtn({ children: 'Default Text' })
      const { getByRole } = await render(<Button />)
      const button = getByRole('button')
      await expect.element(button).toHaveTextContent('Default Text')
    })
  })

  describe('render', () => {
    test('renders element from render prop instead of default tag', async () => {
      const Button = createBtn()
      const { getByRole } = await render(
        <Button render={<a href="/path" />}>Link</Button>,
      )
      const link = getByRole('link')
      await expect.element(link).toHaveTextContent('Link')
      await expect.element(link).toHaveAttribute('href', '/path')
    })

    test('render function receives props and state', async () => {
      const Button = createBtn()
      const { getByRole } = await render(
        <Button
          className="custom"
          render={(props, state) => (
            <a
              {...props}
              href="/path"
              data-active={state.isActive}
              onClick={(e) => {
                e.preventDefault()
                props.onClick?.(e)
              }}
            />
          )}
        >
          Link
        </Button>,
      )
      const link = getByRole('link')
      await expect.element(link).toHaveTextContent('Link')
      await expect.element(link).toHaveAttribute('href', '/path')
      await expect.element(link).toHaveClass('custom')
      await expect.element(link).toHaveAttribute('data-active', 'false')

      await link.click()
      await expect.element(link).toHaveAttribute('data-active', 'true')
    })

    test('element render prop with children as function', async () => {
      const Button = createBtn()
      const { getByRole } = await render(
        <Button render={<a href="/path" />}>
          {(state) => (state.isActive ? 'Active Link' : 'Inactive Link')}
        </Button>,
      )
      const link = getByRole('link')
      await expect.element(link).toHaveTextContent('Inactive Link')
      await expect.element(link).toHaveAttribute('href', '/path')
    })

    test('function render prop with children as function', async () => {
      const Button = createBtn()
      const { getByRole } = await render(
        <Button
          render={(props, state) => (
            <a
              {...props}
              href="/path"
              data-active={state.isActive}
              onClick={(e) => {
                e.preventDefault()
                props.onClick?.(e)
              }}
            />
          )}
        >
          {(state) => (state.isActive ? 'Active Link' : 'Inactive Link')}
        </Button>,
      )
      const link = getByRole('link')
      await expect.element(link).toHaveTextContent('Inactive Link')
      await expect.element(link).toHaveAttribute('data-active', 'false')

      await link.click()
      await expect.element(link).toHaveTextContent('Active Link')
      await expect.element(link).toHaveAttribute('data-active', 'true')
    })
  })

  describe('event handler composition', () => {
    test('composes event handlers - both run, user first then default', async () => {
      const callOrder: string[] = []
      const defaultHandler = vi.fn(() => callOrder.push('default'))
      const userHandler = vi.fn(() => callOrder.push('user'))

      const Button = createBtn({ onMouseEnter: defaultHandler })
      const { getByRole } = await render(
        <Button onMouseEnter={userHandler}>Click</Button>,
      )
      const button = getByRole('button')

      await button.hover()

      expect(defaultHandler).toHaveBeenCalledTimes(1)
      expect(userHandler).toHaveBeenCalledTimes(1)
      expect(callOrder).toEqual(['user', 'default'])
    })

    test('user handler return value is preserved', async () => {
      const defaultHandler = vi.fn(() => 'default-result')
      const userHandler = vi.fn(() => 'user-result')

      let capturedResult: unknown
      function TestButton(props: ComponentProps<'button', State>) {
        const [isActive, setIsActive] = useState(false)
        return useRender(
          'button',
          { isActive },
          {
            props,
            baseProps: {
              onClick: (_e: React.MouseEvent) => {
                setIsActive((cur) => !cur)
                return defaultHandler()
              },
            },
          },
        )
      }

      const { getByRole } = await render(
        <TestButton
          onClick={() => {
            capturedResult = userHandler()
            return capturedResult
          }}
        >
          Click
        </TestButton>,
      )
      const button = getByRole('button')

      await button.click()

      expect(userHandler).toHaveBeenCalled()
      expect(defaultHandler).toHaveBeenCalled()
      expect(capturedResult).toBe('user-result')
    })

    test('only default handler runs when no user handler provided', async () => {
      const defaultHandler = vi.fn()
      const Button = createBtn({ onMouseEnter: defaultHandler })
      const { getByRole } = await render(<Button>Click</Button>)
      const button = getByRole('button')

      await button.hover()

      expect(defaultHandler).toHaveBeenCalledTimes(1)
    })

    test('only user handler runs when no default handler', async () => {
      const userHandler = vi.fn()
      const Button = createBtn()
      const { getByRole } = await render(
        <Button onMouseEnter={userHandler}>Click</Button>,
      )
      const button = getByRole('button')

      await button.hover()

      expect(userHandler).toHaveBeenCalledTimes(1)
    })

    test('composed onClick still updates internal state', async () => {
      const userHandler = vi.fn()
      const Button = createBtn()
      const { getByRole } = await render(
        <Button
          className={(state) => (state.isActive ? 'active' : 'inactive')}
          onClick={userHandler}
        >
          Click
        </Button>,
      )
      const button = getByRole('button')

      await expect.element(button).toHaveClass('inactive')
      await button.click()
      await expect.element(button).toHaveClass('active')
      expect(userHandler).toHaveBeenCalledTimes(1)
    })
  })
})
