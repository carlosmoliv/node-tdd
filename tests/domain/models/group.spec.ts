import { Group } from '@domain/models'

describe('Group', () => {
  it('should return false if when userId is invalid', async () => {
    const group = new Group({ users: [{ id: 'any_user_id', permission: 'user' }] })

    const isAdmin = group.isAdmin('invalid_id')

    expect(isAdmin).toBe(false)
  })

  it('should return false when permission user', async () => {
    const group = new Group({ users: [{ id: 'any_user_id', permission: 'user' }] })

    const isAdmin = group.isAdmin('any_user_id')

    expect(isAdmin).toBe(false)
  })

  it('should return true when permission admin', async () => {
    const group = new Group({ users: [{ id: 'any_user_id', permission: 'admin' }] })

    const isAdmin = group.isAdmin('any_user_id')

    expect(isAdmin).toBe(true)
  })

  it('should return true when permission owner', async () => {
    const group = new Group({ users: [{ id: 'any_user_id', permission: 'owner' }] })

    const isAdmin = group.isAdmin('any_user_id')

    expect(isAdmin).toBe(true)
  })
})
