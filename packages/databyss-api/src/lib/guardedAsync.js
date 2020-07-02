// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
export default fn => (...args) => {
  fn(...args).catch(args[2])
}
