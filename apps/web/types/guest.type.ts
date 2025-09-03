export type guestType = {
    id: string,
    username: string
    isGuest: boolean,
    roomId?: string,
    createdAt: Date,
    updatedAt: Date,
    lastLoginAt: Date
}