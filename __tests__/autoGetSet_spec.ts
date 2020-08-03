import createApp, { createPageModule, autoGetSet } from '../src'

describe('autoGetSet', () => {
  const moduleOpt = {
    initialState: {
      count: 1
    }
  }

  test('auto get & set', () => {
    const app = createApp()
    const module2 = createPageModule('module2', autoGetSet(moduleOpt))

    app.addPage(module2)

    app.start()

    expect(module2.selectors.getCount(app._store.getState())).toBe(1)
    app._store.dispatch(module2.actions.setCount(2))
    expect(module2.selectors.getCount(app._store.getState())).toBe(2)
  })
})
