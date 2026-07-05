import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminPassword = process.env.ADMIN_PASSWORD
        if (!adminPassword) {
          throw new Error('ADMIN_PASSWORD not configured')
        }
        if (credentials?.password === adminPassword) {
          return { id: '1', name: 'Admin', email: 'admin@keevanstore.in' }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}
