import { Document } from '@databyss-org/services/interfaces'

export const DocumentArrayToDict = <T extends Document>(array: any[]) =>
  array.reduce((dict: { [_id: string]: T }, current) => {
    dict[current._id] = current
    return dict
  }, {})
