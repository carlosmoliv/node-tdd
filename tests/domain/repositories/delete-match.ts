import { DeleteMatchRepo } from '@domain/repositories'

export class DeleteMatchRepoMock implements DeleteMatchRepo {
  eventId?: string
  callsCount = 0

  async delete ({ eventId }: { eventId: string }): Promise<void> {
    this.eventId = eventId
    this.callsCount++
  }
}
