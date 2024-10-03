import { sprintSchema, querySchema, sprintUpdateSchema } from './schema'

const sprintValidators = () => ({
  parseSprintId: (sprintId: unknown) =>
    sprintSchema.omit({ fullTitle: true, sprintCode: true }).parse(sprintId),

  parseSprintQuery: (limit: unknown) => querySchema.parse(limit),

  parseSprint: (sprint: unknown) => sprintSchema.parse(sprint),
  parseSprintUpdatable: (sprint: unknown) => sprintUpdateSchema.parse(sprint),
})

export default sprintValidators
