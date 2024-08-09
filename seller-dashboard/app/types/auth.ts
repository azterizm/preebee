export interface AuthUser {
  id: string
  name: string
  email: string
  avatarURL?: string | null
  shop?: { id: string; name: string } | null
}
