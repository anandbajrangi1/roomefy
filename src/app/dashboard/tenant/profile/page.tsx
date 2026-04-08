import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import ProfileClient from "@/components/ProfileClient";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    const bookings = await prisma.booking.findMany({
        where: { tenantId: userId },
        include: { room: { include: { property: true } } }
    });

    const inquiriesCount = await prisma.inquiry.count({
        where: { userId }
    });

    const mappedBookings = bookings.map(b => {
        let images = [];
        try { images = JSON.parse(b.room.images); } catch(e) {}
        return {
            ...b,
            room: { ...b.room, images }
        };
    });

    return <ProfileClient user={user} bookings={mappedBookings} initialInquiriesCount={inquiriesCount} />;
}
