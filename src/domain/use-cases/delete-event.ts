import { DeleteEventRepo, DeleteMatchRepo, LoadGroupRepo } from '@domain/repositories'

export class DeleteEvent {
  constructor (
    private readonly loadGroupRepo: LoadGroupRepo,
    private readonly deleteEventRepo: DeleteEventRepo,
    private readonly deleteMatchRepo: DeleteMatchRepo
  ) {}

  async perform ({ id, userId }: { id: string, userId: string }): Promise<void> {
    const group = await this.loadGroupRepo.load({ eventId: id })
    if (group?.isAdmin(userId) !== true) throw new Error('Permission denied')
    await this.deleteEventRepo.delete({ id })
    await this.deleteMatchRepo.delete({ eventId: id })
  }
}
