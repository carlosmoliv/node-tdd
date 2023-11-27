export interface DeleteMatchRepo {
  delete: (input: { eventId: string }) => Promise<void>
}
