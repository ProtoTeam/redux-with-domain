import createApp, { createDomainModule } from '../src'

describe('domain_module_test', () => {
  const moduleOpt = {
    entities: {
      chart: 'id'
    },
    selectors: {
      getChart: ({ payload, entities }) => {
        const data = entities.chart.get(payload)
        return data
      }
    },
    services: ({ entities }) => ({
      // eslint-disable-next-line require-yield
      *add({ payload }) {
        entities.chart.insert(payload)
      }
    })
  }

  test('add single module', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()
    expect(app._modules.module1).toBe(module1)
  })

  test('add multi modules', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    const module2 = createDomainModule('module2', moduleOpt)
    const modules = [module1, module2]
    app.addDomain(modules)
    app.start()
    expect(app._modules.module1).toBe(module1)
    expect(app._modules.module2).toBe(module2)
  })

  test('entity insert single', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData = { id: 'id_1', name: 'name_1' }
    module1.entities.chart.insert(chartData)
    const data = module1.entities.chart.select()
    expect(data).toEqual([chartData])
  })

  test('entity insert multi & select all & reset', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartDatas = [
      { id: 'id_1', name: 'name_1' },
      { id: 'id_2', name: 'name_2' },
      { id: 'id_3', name: 'name_3' },
      { id: 'id_4', name: 'name_4' },
      { id: 'id_5', name: 'name_5' }
    ]
    module1.entities.chart.insert(chartDatas)
    const data = module1.entities.chart.select()
    expect(data).toEqual(chartDatas)

    app._store.dispatch(module1.services.__reset())
    const data2 = module1.entities.chart.select()
    expect(data2).toEqual([])
  })

  test('entity insert && update', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = [
      { id: 'id_1', name: 'name_1' },
      { id: 'id_2', name: 'name_2' }
    ]
    const chartData2 = [
      { id: 'id_1', name: 'update_1' },
      { id: 'id_2', name: 'update_2' }
    ]
    module1.entities.chart.insert(chartData1)
    module1.entities.chart.insert(chartData2)
    const data = module1.entities.chart.select()

    expect(data).toEqual(chartData2)
  })

  test('entity get single', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = { id: 'id_1', name: 'name_1' }
    const chartData2 = { id: 'id_2', name: 'name_2' }
    module1.entities.chart.insert([chartData1, chartData2])
    const data1 = module1.entities.chart.get('id_1')
    const data2 = module1.entities.chart.get('id_2')

    expect(data1).toEqual(chartData1)
    expect(data2).toEqual(chartData2)
  })

  test('entity get multi', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = { id: 'id_1', name: 'name_1' }
    const chartData2 = { id: 'id_2', name: 'name_2' }
    const chartDatas = [chartData1, chartData2]
    module1.entities.chart.insert(chartDatas)
    const data = module1.entities.chart.get(['id_1', 'id_2'])

    expect(data).toEqual(chartDatas)
  })

  test('entity select with rule', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = { id: 'id_1', name: 'name_1' }
    const chartData2 = { id: 'id_2', name: 'name_2' }
    const chartDatas = [chartData1, chartData2]
    module1.entities.chart.insert(chartDatas)
    const data = module1.entities.chart.select({
      id: 'id_1'
    })
    expect(data).toEqual([chartData1])
  })

  test('entity delete single', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = { id: 'id_1', name: 'name_1' }
    const chartData2 = { id: 'id_2', name: 'name_2' }
    const chartDatas = [chartData1, chartData2]
    module1.entities.chart.insert(chartDatas)
    module1.entities.chart.delete('id_1')
    const data1 = module1.entities.chart.get('id_1')

    expect(data1).toBeUndefined()
  })

  test('entity delete multi', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = { id: 'id_1', name: 'name_1' }
    const chartData2 = { id: 'id_2', name: 'name_2' }
    const chartDatas = [chartData1, chartData2]
    module1.entities.chart.insert(chartDatas)
    module1.entities.chart.delete(['id_1', 'id_2'])
    const data = module1.entities.chart.select()

    expect(data).toEqual([])
  })

  test('entity update single', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = { id: 'id_1', name: 'name_1' }
    const chartData2 = { id: 'id_1', name: 'update_1' }
    module1.entities.chart.insert(chartData1)
    module1.entities.chart.update(chartData2)
    const data = module1.entities.chart.get('id_1')

    expect(data).toEqual(chartData2)
  })

  test('entity update multi', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartDatas1 = [
      { id: 'id_1', name: 'name_1' },
      { id: 'id_2', name: 'name_2' }
    ]
    const chartDatas2 = [
      { id: 'id_1', name: 'update_1' },
      { id: 'id_2', name: 'update_2' }
    ]
    module1.entities.chart.insert(chartDatas1)
    module1.entities.chart.update(chartDatas2)
    const data = module1.entities.chart.select()

    expect(data).toEqual(chartDatas2)
  })

  test('entity update non-existent', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = { id: 'id_1', name: 'name_1' }
    module1.entities.chart.update(chartData1)
    const data = module1.entities.chart.get('id_1')

    expect(data).toBeUndefined()
  })

  test('entity clear', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartDatas = [
      { id: 'id_1', name: 'name_1' },
      { id: 'id_2', name: 'name_2' },
      { id: 'id_3', name: 'name_3' },
      { id: 'id_4', name: 'name_4' },
      { id: 'id_5', name: 'name_5' }
    ]
    module1.entities.chart.insert(chartDatas)
    module1.entities.chart.clear()
    const data = module1.entities.chart.select()

    expect(data).toEqual([])
  })

  test('selector', () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = { id: 'id_1', name: 'name_1' }
    module1.entities.chart.insert(chartData1)

    const data = module1.selectors.getChart('id_1' as any)
    expect(data).toEqual(chartData1)
  })

  test('service', async () => {
    const app = createApp()
    const module1 = createDomainModule('module1', moduleOpt)
    app.addDomain(module1)
    app.start()

    const chartData1 = { id: 'id_1', name: 'name_1' }
    app._store.dispatch(module1.services.add(chartData1))
    const data = module1.entities.chart.get('id_1')

    expect(data).toEqual(chartData1)
  })

  test('auth check', () => {
    let error = null
    const app = createApp()
    const module1 = createDomainModule('module1', {
      entities: {
        chart: 'id'
      },
      services: ({ entities }) => ({
        // eslint-disable-next-line require-yield
        *add({ payload }) {
          entities.chart.insert(payload)
        }
      })
    })
    const module2 = createDomainModule('module2', {
      entities: {
        chart: 'id'
      },
      services: ({ sagaEffects: { put } }) => ({
        *add({ payload }) {
          try {
            // here call actions of another domain module, so it should throw error
            // in development environment.
            yield put(module1.services.add(payload))
          } catch (e) {
            error = e
          }
        }
      })
    })
    const modules = [module1, module2]
    app.addDomain(modules)
    app.start()

    app._store.dispatch(module2.services.add({ id: 1, name: 'a' }))
    expect(error).not.toBeNull()
  })
})
