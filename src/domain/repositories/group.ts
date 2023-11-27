import { Group } from '@domain/models'

export interface LoadGroupRepo {
  load: (input: { eventId: string }) => Promise<Group | undefined>
}
