import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role, otpCode } = await req.json();

    if (!name || !email || !password || !otpCode) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Verify OTP
    const otpRecord = await prisma.otp.findFirst({
      where: { email, code: otpCode }
    });

    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid or missing OTP code" }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    // Cleanup OTP after successful verification
    await prisma.otp.deleteMany({ where: { email } });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || "TENANT"
      }
    });

    return NextResponse.json({ message: "User created successfully", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 });
  }
}
