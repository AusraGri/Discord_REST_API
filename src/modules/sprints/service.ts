import { Request } from 'express'
import buildSprintRepository from './repository'
import type { SprintSelect } from './repository'
import { Database } from '@/database'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import sprintValidators from './validators'

export type DeleteSprintResponse = {
  message: string
}

export interface SprintService {
  getSprints(req: Request): Promise<SprintSelect[]>
  postSprints(req: Request): Promise<SprintSelect>
  patchSprints(req: Request): Promise<SprintSelect>
  deleteSprints(req: Request): Promise<DeleteSprintResponse>
}

export const buildSprintService = (db: Database): SprintService => {
  const sprintRepository = buildSprintRepository(db)
  const validate = sprintValidators()

  const getSprints = async (req: Request): Promise<SprintSelect[]> => {
    const userRequest = { ...req.query }
    const sprintC = userRequest.sprintCode
    const limitIs = userRequest.limit ? Number(userRequest.limit) : undefined
    const sprintId = userRequest.id ? Number(userRequest.id) : undefined

    const { sprintCode, limit } = validate.parseSprintQuery({
      sprintCode: sprintC,
      limit: limitIs,
      id: sprintId,
    })

    const result: SprintSelect[] | [] = await sprintRepository.getSprints({
      sprintCode,
      limit,
      sprintId,
    })

    if (!result || result.length === 0) {
      throw new NotFound('No sprints found')
    }

    return result
  }

  const postSprints = async (req: Request): Promise<SprintSelect> => {
    const userRequest = { ...req.body }
    const { sprintCode, fullTitle } = userRequest

    validate.parseSprintUpdatable({ sprintCode, fullTitle })
    const [sprintCodeExist] = await sprintRepository.getSprints({ sprintCode })

    if (sprintCodeExist)
      throw new BadRequest('Sprint code already in the database')

    const result: SprintSelect | undefined =
      await sprintRepository.insertSprint({
        sprintCode,
        fullTitle,
      })

    if (!result) {
      throw new Error('Failed to insert sprint')
    }

    return result
  }

  const patchSprints = async (req: Request): Promise<SprintSelect> => {
    const sprintId = Number(req.params.id)

    const updatedSprint = { ...req.body }

    validate.parseSprintUpdatable(updatedSprint)
    validate.parseSprintId({ id: sprintId })

    const [sprintExists] = await sprintRepository.getSprints({
      sprintId,
    })

    const { sprintCode, fullTitle } = updatedSprint

    if (!sprintCode && !fullTitle)
      throw new BadRequest('At least one updatable object should be provided')

    if (!sprintExists) throw new BadRequest('No sprint found with id to update')

    if (
      updatedSprint.sprintCode &&
      updatedSprint.sprintCode === sprintExists.sprintCode
    )
      throw new BadRequest('Sprint code already in the database')

    const result: SprintSelect | undefined =
      await sprintRepository.updateSprint({ id: sprintId, ...updatedSprint })

    if (!result) throw new Error('Failed to update')

    return result
  }

  const deleteSprints = async (req: Request): Promise<DeleteSprintResponse> => {
    const sprintId = Number(req.params.id)

    validate.parseSprintId({ id: sprintId })

    const [sprintExists] = await sprintRepository.getSprints({
      sprintId,
    })

    if (!sprintExists) throw new NotFound('Sprint with id is not found')

    const result = await sprintRepository.deleteSprint(sprintId)

    if (!result.numDeletedRows) throw new Error('Failed to delete')

    return { message: 'Sprint deleted successfully' }
  }

  return { getSprints, postSprints, patchSprints, deleteSprints }
}
