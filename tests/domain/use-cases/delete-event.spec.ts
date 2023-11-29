import { Group } from '@domain/models'
import { DeleteEvent } from '@domain/use-cases'
import { DeleteEventRepoMock, DeleteMatchRepoMock, LoadGroupRepoSpy } from '@tests/domain/repositories'

jest.mock('@domain/models/group', () => ({
  Group: jest.fn()
}))

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
  let isAdmin: jest.Mock

  beforeAll(() => {
    isAdmin = jest.fn().mockReturnValue(true)
    const fakeGroup = jest.fn().mockImplementation(() => ({ isAdmin }))
    jest
      .mocked(Group).mockImplementation(fakeGroup)
  })

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

  it('should throw an error when user is not an admin', async () => {
    const { sut } = makeSut()
    isAdmin.mockReturnValueOnce(false)

    const promise = sut.perform({ id, userId })

    await expect(promise).rejects.toThrow()
  })

  it('should not throw an error when user is an admin', async () => {
    const { sut } = makeSut()

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
