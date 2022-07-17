import { Input, exactly } from './inputs'

export const createInput = <T extends string = never>(s: string | Input<T>): Input<T> => {
  return {
    toString: () => s.toString(),
    and: input => createInput(`${s}${exactly(input)}`),
    or: input => createInput(`(${s}|${exactly(input)})`),
    after: input => createInput(`(?<=${exactly(input)})${s}`),
    before: input => createInput(`${s}(?=${exactly(input)})`),
    notAfter: input => createInput(`(?<!${exactly(input)})${s}`),
    notBefore: input => createInput(`${s}(?!${exactly(input)})`),
    times: Object.assign((number: number) => createInput(`(${s}){${number}}`), {
      any: () => createInput(`(${s})*`),
      atLeast: (min: number) => createInput(`(${s}){${min},}`),
      between: (min: number, max: number) => createInput(`(${s}){${min},${max}}`),
    }),
    optionally: () => createInput(`(${s})?`),
    as: key => createInput(`(?<${key}>${s})`),
    at: {
      lineStart: () => createInput(`^${s}`),
      lineEnd: () => createInput(`${s}$`),
    },
  }
}
