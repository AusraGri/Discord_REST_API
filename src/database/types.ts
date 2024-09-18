import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export interface Messages {
  createdAt: Generated<string>
  gifUrl: string
  id: Generated<number>
  originalMessage: string
  sprintId: string
  templateId: number
  userId: number
}

export interface Sprints {
  fullTitle: string
  id: string
}

export interface Templates {
  id: Generated<number>
  text: string
}

export interface Users {
  id: Generated<number>
  username: string
}

export interface DB {
  messages: Messages
  sprints: Sprints
  templates: Templates
  users: Users
}
