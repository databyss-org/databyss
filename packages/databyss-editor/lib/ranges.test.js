import { flattenRanges } from './ranges'

test('flattenRanges should flatten overlapping styles', () => {
  const _ranges = [
    { offset: 20, length: 3, marks: ['highlight'] },
    { offset: 24, length: 10, marks: [['inlineTopic', 'KdamNVdDbcmH']] },
    { offset: 25, length: 3, marks: ['highlight'] },
    { offset: 29, length: 5, marks: ['highlight'] },
  ]
  const _flat = flattenRanges(_ranges)
  // console.log('[flattenRanges] result', JSON.stringify(_flat, null, 2))
  expect(_flat).toEqual([
    { offset: 20, length: 3, marks: ['highlight'] },
    { offset: 24, length: 1, marks: [['inlineTopic', 'KdamNVdDbcmH']] },
    {
      offset: 25,
      length: 3,
      marks: ['highlight', ['inlineTopic', 'KdamNVdDbcmH']],
    },
    { offset: 28, length: 1, marks: [['inlineTopic', 'KdamNVdDbcmH']] },
    {
      offset: 29,
      length: 5,
      marks: ['highlight', ['inlineTopic', 'KdamNVdDbcmH']],
    },
  ])
})

test('flattenRanges should flatten overlapping styles 2', () => {
  const _ranges = [
    { offset: 20, length: 3, marks: ['highlight'] },
    { offset: 24, length: 10, marks: [['inlineTopic', 'KdamNVdDbcmH']] },
    { offset: 25, length: 3, marks: ['highlight'] },
    { offset: 29, length: 5, marks: ['highlight'] },
    { offset: 35, length: 4, marks: ['highlight'] },
  ]
  const _flat = flattenRanges(_ranges)
  // console.log('[flattenRanges] result', JSON.stringify(_flat, null, 2))
  expect(_flat).toEqual([
    { offset: 20, length: 3, marks: ['highlight'] },
    { offset: 24, length: 1, marks: [['inlineTopic', 'KdamNVdDbcmH']] },
    {
      offset: 25,
      length: 3,
      marks: ['highlight', ['inlineTopic', 'KdamNVdDbcmH']],
    },
    { offset: 28, length: 1, marks: [['inlineTopic', 'KdamNVdDbcmH']] },
    {
      offset: 29,
      length: 5,
      marks: ['highlight', ['inlineTopic', 'KdamNVdDbcmH']],
    },
    {
      offset: 35,
      length: 4,
      marks: ['highlight'],
    },
  ])
})
