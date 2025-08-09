import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin?: boolean
    } & DefaultSession['user']
    accessToken?: string
  }

  interface User extends DefaultUser {
    id: string
    accessToken?: string
    isAdmin?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    accessToken?: string
    isAdmin?: boolean
  }
}