import { GroupUser, Permission } from '@domain/models'

export class Group {
  readonly users: GroupUser[]

  constructor ({ users }: { users: [{ id: string, permission: Permission }] }) {
    this.users = users.map(user => new GroupUser(user))
  }

  private findUser (id: string): GroupUser | undefined {
    return this.users.find(user => user.id === id)
  }

  isAdmin (id: string): boolean {
    return this.findUser(id)?.isAdmin() === true
  }
}
