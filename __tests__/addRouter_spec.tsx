import React from 'react'
import { Route, HashRouter } from 'react-router-dom'
import { mount } from 'enzyme'
import _ from 'lodash'
import createApp, { createPageModule } from '../src'

describe('Router', () => {
  const moduleNamespace = 'module1'

  function startApp(...args: any[]) {
    const app = createApp()

    const Container = (props: any) => {
      const { children } = props
      return <div id="root">{children}</div>
    }
    const router = (
      <HashRouter>
        <Route path="/" component={Container} />
      </HashRouter>
    )
    app.addRouter(router)
    const module = createPageModule(moduleNamespace, {
      initialState: {}
    })
    app.addPage(module)

    const routerNode = app.start(...args)
    return {
      app,
      wrapper:
        _.isString(args[0]) || _.isElement(args[0]) ? mount(routerNode) : null
    }
  }

  test('add router', () => {
    const { wrapper } = startApp('#container')
    expect(wrapper.find('#root').length).toBe(1)
  })

  test('app.start with dom element', () => {
    const { wrapper } = startApp(document.querySelector('#container'), _.noop)
    expect(wrapper.find('#root').length).toBe(1)
  })

  test('app.start with callback', () => {
    const mockCallback = jest.fn(_.noop)
    startApp(mockCallback)
    expect(mockCallback.mock.calls.length).toBe(1)
  })

  test('app.start with false', () => {
    const { app } = startApp(false)
    expect(app._modules[moduleNamespace]).toBeDefined()
  })
})
