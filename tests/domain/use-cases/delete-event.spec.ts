class DeleteEvent {
  constructor (
    private readonly loadGroupRepo: LoadGroupRepo
  ) {}

  async perform ({ id }: { id: string, userId: string }): Promise<void> {
    await this.loadGroupRepo.load({ eventId: id })
  }
}

interface LoadGroupRepo {
  load: (input: { eventId: string }) => Promise<void>
}

class LoadGroupRepoSpy implements LoadGroupRepo {
  eventId: string | undefined
  callsCount = 0

  async load ({ eventId }: { eventId: string }): Promise<void> {
    this.eventId = eventId
    this.callsCount++
  }
}

describe('DeleteEvent', () => {
  it('should get group data', async () => {
    const id = 'any_event_id'
    const userId = 'any_user_id'
    const loadGroupRepo = new LoadGroupRepoSpy()
    const sut = new DeleteEvent(loadGroupRepo)

    await sut.perform({ id, userId })

    expect(loadGroupRepo.eventId).toBe(id)
    expect(loadGroupRepo.callsCount).toBe(1)
  })
})
