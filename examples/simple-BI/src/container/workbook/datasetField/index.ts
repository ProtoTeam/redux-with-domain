import { createContainerModule } from 'redux-with-domain'
import datasetDomain, { DatasetItem, Field } from '../../../domain/dataset'

/**
 * {page-module}
 */
export default createContainerModule('workbook/datasetFields', {
  initialState: {
    filter: ''
  },
  selectors: {
    getDatasetFields: (state, { pageSelectors } = {}): Field[] => {
      const selectedDatasetId: string = pageSelectors.getSelectedDatasetId()
      const dataset: DatasetItem = datasetDomain.entities.datasetList.get(
        selectedDatasetId
      )
      const fields = dataset ? dataset.fields : []
      // 过滤逻辑
      if (state.filter.length > 0) {
        return fields.filter(field => field.name.includes(state.filter))
      }
      return fields
    }
  },
  reducers: {
    updateFilter: (state, { payload }) => {
      return {
        ...state,
        filter: payload || ''
      }
    }
  },
  effects: () => {}
})
