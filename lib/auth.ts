import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const client = await clientPromise;
          const db = client.db();
          const usersCollection = db.collection("users");
          
          // Use case-insensitive email comparison
          const user = await usersCollection.findOne({ 
            email: { $regex: new RegExp(`^${credentials.email}$`, 'i') }
          });

          if (!user || !user.password) {
            console.log('User not found:', credentials.email);
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            throw new Error("Invalid credentials");
          }

          // Return normalized user data
          return {
            id: user._id.toString(),
            email: user.email.toLowerCase(), // Normalize email
            name: user.name || null,
            image: user.image || null,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          // Always return "Invalid credentials" to avoid leaking information
          throw new Error("Invalid credentials");
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export async function hashPassword(password: string) {
  return await hash(password, 12);
}
