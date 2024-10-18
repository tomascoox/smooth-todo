import { hash, compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
        console.log("Authorize function called");
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error("Invalid credentials");
        }

        try {
          const client = await clientPromise;
          const usersCollection = client.db().collection("users");
          const user = await usersCollection.findOne({ email: credentials.email });

          console.log("User found:", !!user);

          if (!user || !user.password) {
            console.log("User not found or password missing");
            throw new Error("User not found");
          }

          const isPasswordValid = await compare(credentials.password, user.password);
          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return the full user object (excluding the password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            // Add any other fields you want to include in the session
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  }
};

export async function hashPassword(password: string) {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
}
