export default (startTime) => {
  if (typeof startTime !== 'number') {
    throw new Error('Method expects `startTime` to be a number.')
  }

  const endTime = new Date().getTime()
  return endTime - startTime
}
