import { DeleteEventRepo } from '@domain/repositories'

export class DeleteEventRepoMock implements DeleteEventRepo {
  id?: string
  callsCount = 0

  async delete ({ id }: { id: string }): Promise<void> {
    this.id = id
    this.callsCount++
  }
}
