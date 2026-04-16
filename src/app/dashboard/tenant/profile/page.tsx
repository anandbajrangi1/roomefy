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

    const inquiriesCount = await prisma.inquiry.count({
        where: { userId }
    });

    return <ProfileClient user={user} initialInquiriesCount={inquiriesCount} />;
}
