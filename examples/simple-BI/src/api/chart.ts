import _ from 'lodash'
import { MOCK_DATA } from '../common/mock'

export const queryData = (datasetId: string, fieldIds: string[]) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockData = MOCK_DATA[datasetId]
      if (!mockData) {
        reject(new Error('data not found'))
      }
      resolve(
        MOCK_DATA[datasetId].map((data: any) => {
          return _.pick(data, fieldIds)
        })
      )
    }, 0)
  })
}
