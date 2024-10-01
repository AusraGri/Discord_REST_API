import { sprintSchema, querySchema, sprintUpdateSchema } from './schema'

const sprintValidators = () => ({
  // parseSprintCode: (sprintCode: unknown) =>
  //   sprintSchema.omit({ fullTitle: true }).parse(sprintCode),

  parseSprintId: (sprintId: unknown) =>
    sprintSchema.omit({ fullTitle: true, sprintCode: true }).parse(sprintId),

  parseSprintQuery: (limit: unknown) => querySchema.parse(limit),

  parseSprint: (sprint: unknown) => sprintSchema.parse(sprint),
  parseSprintUpdatable: (sprint: unknown) => sprintUpdateSchema.parse(sprint),
})

export default sprintValidators
