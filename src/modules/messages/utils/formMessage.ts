import { userMention } from 'discord.js'
import { UsersSelect } from '../../users/repository'

export interface FormDiscordMessage {
  template: string
  user: UsersSelect
  sprintTitle: string
}

export default async function formDiscordMessage(options: FormDiscordMessage) {
  const mentionUser = userMention(options.user.id)

  const formedMessage = insertValuesToTemplate(options.template, {
    username: mentionUser,
    sprint: options.sprintTitle,
  })

  return formedMessage
}

function insertValuesToTemplate(
  template: string,
  replacements: { [key: string]: string }
): string {
  return template.replace(/{(.*?)}/g, (_, key) =>
    key in replacements ? replacements[key] : `{${key}}`
  )
}
