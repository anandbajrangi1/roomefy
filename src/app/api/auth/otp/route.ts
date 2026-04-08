import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete old OTPs for this email to prevent clutter
        await prisma.otp.deleteMany({ where: { email } });

        // Save new OTP
        await prisma.otp.create({
            data: {
                email,
                code,
                expiresAt
            }
        });

        // Send Email via Mailjet
        try {
            await sendOtpEmail(email, code);
        } catch (err) {
            console.error("Mailjet Error during OTP send:", err);
            return NextResponse.json({ message: "Failed to send email. Check API configuration." }, { status: 500 });
        }

        return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
    } catch (error) {
        console.error("OTP API Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
