import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const nextAuth = NextAuth({
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== 'demo-google-client-id' ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Try to authenticate with FastAPI backend
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            return {
              id: data.user._id,
              email: data.user.email,
              name: data.user.username,
              accessToken: data.access_token,
              isAdmin: data.user.is_admin,
            }
          } else {
            // For demo mode - allow any email/password combination
            console.log('Backend login failed, using demo mode')
            return {
              id: 'demo-user-' + Date.now(),
              email: credentials.email,
              name: credentials.email.split('@')[0],
              accessToken: 'demo-token',
              isAdmin: credentials.email.includes('admin'),
            }
          }
        } catch (error) {
          // Fallback to demo mode if backend is unavailable
          console.log('Backend unavailable, using demo mode:', error)
          return {
            id: 'demo-user-' + Date.now(),
            email: credentials.email,
            name: credentials.email.split('@')[0],
            accessToken: 'demo-token',
            isAdmin: credentials.email.includes('admin'),
          }
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        // @ts-ignore - NextAuth types don't include custom fields
        session.accessToken = token.accessToken
        // @ts-ignore
        session.user.isAdmin = token.isAdmin
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // @ts-ignore
        token.accessToken = user.accessToken
        // @ts-ignore
        token.isAdmin = user.isAdmin
      }

      // Handle Google OAuth
      if (account?.provider === 'google' && user) {
        try {
          // Register/login with backend using Google account info
          const response = await fetch(`${API_BASE_URL}/api/auth/oauth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              google_id: user.id,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            token.accessToken = data.access_token
            token.id = data.user._id
            token.isAdmin = data.user.is_admin
          } else {
            // Demo mode fallback
            token.accessToken = 'demo-google-token'
            token.isAdmin = false
          }
        } catch (error) {
          console.log('Google OAuth backend registration failed, using demo mode:', error)
          token.accessToken = 'demo-google-token'
          token.isAdmin = false
        }
      }

      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key',
})

export const { handlers, auth, signIn, signOut } = nextAuth