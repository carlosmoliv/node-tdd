class DeleteEvent {
  constructor (
    private readonly loadGroupRepo: LoadGroupRepo
  ) {}

  async perform ({ id, userId }: { id: string, userId: string }): Promise<void> {
    const group = await this.loadGroupRepo.load({ eventId: id })
    if (group === undefined) throw new Error('Group not found')
    const user = group.users.find(user => user.id === userId)
    if (user === undefined) throw new Error('User not found')
  }
}

interface LoadGroupRepo {
  load: (input: { eventId: string }) => Promise<Group | undefined>
}

type Group = {
  users: GroupUser[]
}

type GroupUser = {
  id: string
  permission: string
}

class LoadGroupRepoSpy implements LoadGroupRepo {
  eventId?: string
  callsCount = 0
  output?: Group = {
    users: [{ id: 'any_user_id', permission: 'any' }]
  }

  async load ({ eventId }: { eventId: string }): Promise<Group | undefined> {
    this.eventId = eventId
    this.callsCount++
    return this.output
  }
}

type SutTypes = {
  sut: DeleteEvent
  loadGroupRepo: LoadGroupRepoSpy
}

const makeSut = (): SutTypes => {
  const loadGroupRepo = new LoadGroupRepoSpy()
  const sut = new DeleteEvent(loadGroupRepo)
  return { sut, loadGroupRepo }
}

describe('DeleteEvent', () => {
  const id = 'any_event_id'
  const userId = 'any_user_id'

  it('should get group data', async () => {
    const { loadGroupRepo, sut } = makeSut()

    await sut.perform({ id, userId })

    expect(loadGroupRepo.eventId).toBe(id)
    expect(loadGroupRepo.callsCount).toBe(1)
  })

  it('should throw if eventId is invalid', async () => {
    const { sut, loadGroupRepo } = makeSut()
    loadGroupRepo.output = undefined

    const promise = sut.perform({ id, userId })

    await expect(promise).rejects.toThrow()
  })

  it('should throw if userId is invalid', async () => {
    const { sut, loadGroupRepo } = makeSut()
    loadGroupRepo.output = {
      users: [{ id: 'any_user_id', permission: 'any' }]
    }

    const promise = sut.perform({ id, userId: 'invalid_user_id' })

    await expect(promise).rejects.toThrow()
  })
})
