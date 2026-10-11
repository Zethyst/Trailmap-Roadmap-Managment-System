import { handlers } from '@/auth'

// NextAuth v5 route handler — exposes /api/auth/* (signin, callback, session, signout…)
export const { GET, POST } = handlers
