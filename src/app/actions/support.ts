"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createSupportTicket(data: { name: string, email: string, category: string, subject: string, message: string }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    return prisma.supportTicket.create({
        data: {
            name: data.name,
            email: data.email,
            category: data.category,
            subject: data.subject,
            message: data.message,
            userId: userId,
            status: "OPEN"
        }
    });
}

export async function getSupportTickets() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') throw new Error("Unauthorized");

    return prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });
}

export async function updateSupportTicketStatus(id: string, status: string, adminNote?: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') throw new Error("Unauthorized");

    return prisma.supportTicket.update({
        where: { id },
        data: { 
            status,
            ...(adminNote !== undefined && { adminNote })
        }
    });
}
