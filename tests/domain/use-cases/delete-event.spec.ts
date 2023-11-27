class DeleteEvent {
  constructor (
    private readonly loadGroupRepo: LoadGroupRepo,
    private readonly deleteEventRepo: DeleteEventRepo
  ) {}

  async perform ({ id, userId }: { id: string, userId: string }): Promise<void> {
    const group = await this.loadGroupRepo.load({ eventId: id })
    if (group === undefined) throw new Error('Group not found')
    const user = group.users.find(user => user.id === userId)
    if (user === undefined) throw new Error('User not found')
    if (user.permission === 'user') throw new Error('User not authorized')
    await this.deleteEventRepo.delete({ id })
  }
}

interface LoadGroupRepo {
  load: (input: { eventId: string }) => Promise<Group | undefined>
}

interface DeleteEventRepo {
  delete: (input: { id: string }) => Promise<void>
}

type Group = {
  users: GroupUser[]
}

type GroupUser = {
  id: string
  permission: 'owner' | 'admin' | 'user'
}

class LoadGroupRepoSpy implements LoadGroupRepo {
  eventId?: string
  callsCount = 0
  output?: Group = {
    users: [{ id: 'any_user_id', permission: 'admin' }]
  }

  async load ({ eventId }: { eventId: string }): Promise<Group | undefined> {
    this.eventId = eventId
    this.callsCount++
    return this.output
  }
}

class DeleteEventRepoMock implements DeleteEventRepo {
  id?: string
  callsCount = 0

  async delete ({ id }: { id: string }): Promise<void> {
    this.id = id
    this.callsCount++
  }
}

type SutTypes = {
  sut: DeleteEvent
  loadGroupRepo: LoadGroupRepoSpy
  deleteEventRepo: DeleteEventRepoMock
}

const makeSut = (): SutTypes => {
  const loadGroupRepo = new LoadGroupRepoSpy()
  const deleteEventRepo = new DeleteEventRepoMock()
  const sut = new DeleteEvent(loadGroupRepo, deleteEventRepo)
  return { sut, loadGroupRepo, deleteEventRepo }
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

  it('should throw an error if eventId is invalid', async () => {
    const { sut, loadGroupRepo } = makeSut()
    loadGroupRepo.output = undefined

    const promise = sut.perform({ id, userId })

    await expect(promise).rejects.toThrow()
  })

  it('should throw an error if userId is invalid', async () => {
    const { sut, loadGroupRepo } = makeSut()
    loadGroupRepo.output = {
      users: [{ id: 'any_user_id', permission: 'admin' }]
    }

    const promise = sut.perform({ id, userId: 'invalid_user_id' })

    await expect(promise).rejects.toThrow()
  })

  it('should throw an error when permission user', async () => {
    const { sut, loadGroupRepo } = makeSut()
    loadGroupRepo.output = {
      users: [{ id: 'any_user_id', permission: 'user' }]
    }

    const promise = sut.perform({ id, userId })

    await expect(promise).rejects.toThrow()
  })

  it('should not throw an error when permission is admin', async () => {
    const { sut, loadGroupRepo } = makeSut()
    loadGroupRepo.output = {
      users: [{ id: 'any_user_id', permission: 'admin' }]
    }

    const promise = sut.perform({ id, userId })

    await expect(promise).resolves.not.toThrow()
  })

  it('should not throw an error when permission is owner', async () => {
    const { sut, loadGroupRepo } = makeSut()
    loadGroupRepo.output = {
      users: [{ id: 'any_user_id', permission: 'owner' }]
    }

    const promise = sut.perform({ id, userId })

    await expect(promise).resolves.not.toThrow()
  })

  it('should delete an event', async () => {
    const { sut, deleteEventRepo } = makeSut()

    await sut.perform({ id, userId })

    expect(deleteEventRepo.id).toBe(id)
    expect(deleteEventRepo.callsCount).toBe(1)
  })
})
