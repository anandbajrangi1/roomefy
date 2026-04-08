"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

/**
 * Updates the user's personal profile information.
 */
export async function updateUserProfile(data: { name: string; phone: string; avatarUrl?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
            name: data.name,
            phone: data.phone,
            avatarUrl: data.avatarUrl,
        }
    });

    revalidatePath('/dashboard/tenant/profile');
    revalidatePath('/dashboard/admin');
    return updatedUser;
}

/**
 * Update user password (Simulated for security in this development phase).
 */
export async function updateUserPassword(currentPass: string, newPass: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    // In a real production app, we would hash the new password and compare currentPass.
    // For this design module, we simulate success for authorized users.
    
    if (newPass.length < 6) throw new Error("Password must be at least 6 characters.");

    return { success: true, message: "Password updated successfully (Simulated)." };
}

/**
 * Fetches an account performance summary for the logged-in user.
 */
export async function getAccountSummary() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            bookings: true,
            properties: true,
            inquiries: true
        }
    });

    if (!user) return null;

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt, // For ProfileEditor
        totalBookings: user.bookings.length,
        totalProperties: user.properties.length,
        totalInquiries: user.inquiries.length,
        memberSince: user.createdAt,
    };
}
