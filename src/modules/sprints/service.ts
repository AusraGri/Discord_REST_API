import { Request} from 'express'
import buildSprintRepository from './repository'
import type { SprintSelect } from './repository'
import { Database } from '@/database'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import sprintValidators from './validators';

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

    const {sprintCode, limit} = validate.parseSprintQuery({sprintCode: sprintC, limit: limitIs})

    const result: SprintSelect[] | [] =
      await sprintRepository.getSprints({ sprintCode, limit })

    if (!result || result.length === 0) {
      throw new NotFound('No sprints found')
    }

    return result
  }

  const postSprints = async (req: Request): Promise<SprintSelect> => {
    const userRequest = { ...req.body }
    const { sprintCode, fullTitle } = userRequest

    validate.parseSprint({ sprintCode, fullTitle })

    const result: SprintSelect | undefined =
      await sprintRepository.insertSprint({
        sprintCode, fullTitle
      })

    if (!result) {
      throw new Error('Failed to insert sprint')
    }

    return result
  }

  const patchSprints = async (req: Request): Promise<SprintSelect> => {
    const updatedSprint = { ...req.body }

    validate.parseSprint(updatedSprint)

    const sprintExists = await sprintRepository.getSprints({
      sprintCode: updatedSprint.sprintCode,
    })

    if (!sprintExists || sprintExists.length === 0)
      throw new BadRequest('Invalid sprint id')

    const result: SprintSelect | undefined =
      await sprintRepository.updateSprint(updatedSprint)

    if (!result) throw new Error('Failed to update')

    return result
  }

  const deleteSprints = async (
    req: Request
  ): Promise<DeleteSprintResponse> => {
    const {sprintId} = req.params

    const id = Number(sprintId)

    validate.parseSprintId({ sprintId: id })

    const sprintExists = await sprintRepository.getSprints({
      sprintId: id
    })

    if (!sprintExists || sprintExists.length === 0)
      throw new BadRequest('Invalid sprint id')

    const result = await sprintRepository.deleteSprint(id)

    if (!result.numDeletedRows) throw new Error('Failed to delete')

    return { message: 'Sprint deleted successfully' }
  }

  return { getSprints, postSprints, patchSprints, deleteSprints }
}
