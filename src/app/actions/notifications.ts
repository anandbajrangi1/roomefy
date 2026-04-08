"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Fetches notifications for the logged-in user.
 */
export async function getNotifications() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) return [];

    return prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
}

/**
 * Marks a specific notification as read.
 */
export async function markAsRead(id: string) {
    return prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
}

/**
 * Marks all notifications as read for the current user.
 */
export async function markAllRead() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) return;

    return prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
    });
}

/**
 * Internal utility to create a notification for a user.
 * Can be called from other server actions.
 */
export async function createNotification(userId: string, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' = 'INFO') {
    return prisma.notification.create({
        data: {
            userId,
            title,
            message,
            type,
        }
    });
}
