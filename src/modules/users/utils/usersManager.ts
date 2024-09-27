import { Database } from '@/database'
import buildUserRepository, { UsersSelect } from '../repository'
import refreshUsersData from './refreshUsersData'
import{ DiscordBotServiceInterface } from '@/modules/discord/discordBotService'

export interface UsersManager {
  getUser (username: string): Promise<UsersSelect | undefined>
}

const usersManager = (db: Database, discordBot: DiscordBotServiceInterface): UsersManager => ({
  getUser: async (username: string) => {
    const userRepository = buildUserRepository(db)
    let user = await userRepository.getUserByUsername(username)
    if (!user) {
      await refreshUsersData(db, discordBot)
    }

    user = await userRepository.getUserByUsername(username)

    return user
  },
})

export default usersManager
