import { DeleteEvent } from '@domain/use-cases'
import { DeleteEventRepoMock, DeleteMatchRepoMock, LoadGroupRepoSpy } from '@tests/domain/repositories'

type SutTypes = {
  sut: DeleteEvent
  loadGroupRepo: LoadGroupRepoSpy
  deleteEventRepo: DeleteEventRepoMock
  deleteMatchRepo: DeleteMatchRepoMock
}

const makeSut = (): SutTypes => {
  const loadGroupRepo = new LoadGroupRepoSpy()
  const deleteEventRepo = new DeleteEventRepoMock()
  const deleteMatchRepo = new DeleteMatchRepoMock()
  const sut = new DeleteEvent(loadGroupRepo, deleteEventRepo, deleteMatchRepo)
  return {
    sut,
    loadGroupRepo,
    deleteEventRepo,
    deleteMatchRepo
  }
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

  it('should delete matches', async () => {
    const { sut, deleteMatchRepo } = makeSut()

    await sut.perform({ id, userId })

    expect(deleteMatchRepo.eventId).toBe(id)
    expect(deleteMatchRepo.callsCount).toBe(1)
  })
})
