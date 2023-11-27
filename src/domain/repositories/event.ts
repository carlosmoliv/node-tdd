export interface DeleteEventRepo {
  delete: (input: { id: string }) => Promise<void>
}
