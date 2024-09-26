import { Database } from '@/database'
import {
  DiscordBotServiceInterface,
  DiscordUser,
} from '../../discord/discordBotService'
import buildUsersRepository, { UsersSelect } from '../repository'

const refreshUsersData = async (
  db: Database,
  discordBot: DiscordBotServiceInterface
) => {
  const usersRepository = buildUsersRepository(db)

  const allDiscordUsers: DiscordUser[] =
    await discordBot.getAllUsersFromChannel()
  const usersFromDatabase: UsersSelect[] = await usersRepository.getUsers()

  const existingUsersIds = usersFromDatabase.map((user) => user.id)
  const allDiscordUserIds = allDiscordUsers.map((user) => user.id)

  // Find users to remove
  const usersToRemove = existingUsersIds.filter(
    (userId) => !allDiscordUserIds.includes(userId)
  )

  if (usersToRemove.length > 0) {
    await Promise.all(usersToRemove.map((id) => usersRepository.deleteUser(id)))
  }

  // Find users to add
  const usersToAdd = allDiscordUsers.filter(
    (user) => !existingUsersIds.includes(user.id)
  )

  if (usersToAdd.length > 0) {
    await Promise.all(
      usersToAdd.map((user) => usersRepository.insertUser(user))
    )
  }
}

export default refreshUsersData
