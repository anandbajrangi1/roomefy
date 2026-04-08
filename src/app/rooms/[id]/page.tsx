import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import RoomDetailClient from "@/components/RoomDetailClient";

export default async function RoomDetail({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const roomId = resolvedParams?.id;

    if (!roomId) {
        return notFound();
    }

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { property: true }
    });

    if (!room) {
        return notFound();
    }

    return <RoomDetailClient room={room} property={room.property} />;
}
