export const isUpDownKey = (e) => {
  const whitelist = ['ArrowUp', 'ArrowDown']
  return whitelist.findIndex((w) => w === e.key) > -1
}
