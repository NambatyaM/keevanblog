import { withAuth } from 'next-auth/middleware'

export const config = {
  matcher: ['/admin/:path*'],
}

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
})
