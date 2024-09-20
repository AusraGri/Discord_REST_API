import { sprintSchema, querySchema } from './schema'

const sprintValidators = () => ({
  parseSprintCode: (sprintCode: unknown) =>
    sprintSchema.omit({ fullTitle: true }).parse(sprintCode),

  parseSprintQuery: (limit: unknown) => querySchema.parse(limit),

  parseSprint: (sprint: unknown) => sprintSchema.parse(sprint),
})

export default sprintValidators
// export const parseSprintCode = (sprintCode: unknown) =>
//     sprintSchema.omit({ fullTitle: true }).parse(sprintCode)

// export const parseLimit= (limit: unknown) =>
//     limitSchema.parse(limit)

// export const parseSprint = (sprint: unknown) =>
//     sprintSchema.parse(sprint)
// const sprintValidate = () => {
//     const parseSprint = (message: unknown) =>
//         sprintSchema.parse(message)

//       const parseSprintCode = (message: unknown) =>
//         sprintSchema.omit({ fullTitle: true }).parse(message)

//       const parseSprintTitle = (message: unknown) =>
//         sprintSchema.omit({ sprintCode: true }).parse(message)

//       return {parseSprint}
// }
