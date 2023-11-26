class DeleteEvent {
  constructor (
    private readonly loadGroupRepo: LoadGroupRepo
  ) {}

  async perform ({ id }: { id: string, userId: string }): Promise<void> {
    const group = await this.loadGroupRepo.load({ eventId: id })
    if (group === undefined) throw new Error('Group not found')
  }
}

interface LoadGroupRepo {
  load: (input: { eventId: string }) => Promise<any>
}

class LoadGroupRepoSpy implements LoadGroupRepo {
  eventId?: string
  callsCount = 0
  output: any = {}

  async load ({ eventId }: { eventId: string }): Promise<undefined> {
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
  const id = 'any_id'
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
})
