import { DeleteEventRepo, DeleteMatchRepo, LoadGroupRepo } from '@domain/repositories'

export class DeleteEvent {
  constructor (
    private readonly loadGroupRepo: LoadGroupRepo,
    private readonly deleteEventRepo: DeleteEventRepo,
    private readonly deleteMatchRepo: DeleteMatchRepo
  ) {}

  async perform ({ id, userId }: { id: string, userId: string }): Promise<void> {
    const group = await this.loadGroupRepo.load({ eventId: id })
    if (group === undefined) throw new Error('Group not found')
    const user = group.users.find(user => user.id === userId)
    if (user === undefined) throw new Error('User not found')
    if (user.permission === 'user') throw new Error('User not authorized')
    await this.deleteEventRepo.delete({ id })
    await this.deleteMatchRepo.delete({ eventId: id })
  }
}
