export const delay = async seconds =>
  new Promise(r => setTimeout(r, seconds * Math.random(1000) + 1000))
