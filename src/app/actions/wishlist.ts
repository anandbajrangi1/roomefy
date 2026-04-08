"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getWishlist(): Promise<string[]> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !(session.user as any).id) return [];
        const userId = (session.user as any).id;
        const items = await prisma.wishlist.findMany({ where: { userId }, select: { roomId: true } });
        return items.map(i => i.roomId);
    } catch {
        return [];
    }
}

export async function toggleWishlistItem(roomId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
        throw new Error("Unauthorized");
    }
    
    const userId = (session.user as any).id;
    
    const existing = await prisma.wishlist.findUnique({
        where: {
            userId_roomId: { userId, roomId }
        }
    });

    if (existing) {
        await prisma.wishlist.delete({
            where: { userId_roomId: { userId, roomId } }
        });
        return { added: false };
    } else {
        await prisma.wishlist.create({
            data: { userId, roomId }
        });
        return { added: true };
    }
}
