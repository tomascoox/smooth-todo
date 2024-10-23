import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    // Check if user exists - make sure to use case-insensitive comparison
    const existingUser = await db.collection("users").findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    
    // Create the new user
    await db.collection("users").insertOne({ 
      email: email.toLowerCase(), // Store email in lowercase
      password: hashedPassword,
      createdAt: new Date()
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
