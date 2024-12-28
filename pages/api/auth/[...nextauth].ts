import { NextApiRequest, NextApiResponse } from "next"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const allowedIPs = process.env.ALLOWED_IPS?.split(",") || []

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
  interface JWT {
    userRole?: string
  }
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress

  if (!allowedIPs.includes(userIP as string)) {
    res.status(403).json({ error: "Access denied" })
    return
  }

  return await NextAuth(req, res, {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (credentials?.password === process.env.ADMIN_PASSWORD) {
            return { id: "1", name: "Admin" }
          }
          return null
        }
      })
    ],
    pages: {
      signIn: "/admin/login",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.userRole = "admin"
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.role = token.userRole as string | undefined;
        }
        return session;
      }
    }
  })
}

