import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import WishlistClient from "@/components/WishlistClient";
import { redirect } from "next/navigation";

export default async function WishlistPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    const wishlistItems = await prisma.wishlist.findMany({
        where: { userId },
        include: { room: { include: { property: true } } }
    });

    const mappedWishlist = wishlistItems.map(item => {
        let images = [];
        try { images = JSON.parse(item.room.images); } catch(e) {}
        return {
            id: item.room.id,
            image: images[0] || "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3",
            badge: item.room.type,
            price: `₹${item.room.rent.toLocaleString()}/mo`,
            society: item.room.property.title,
            location: `${item.room.property.area}, ${item.room.property.city}`,
            beds: item.room.type.includes("1BHK") ? "1" : "Shared",
            baths: "1",
            area: "180 sq.ft",
            propertyType: item.room.property.propertyType,
            genderPreference: item.room.property.genderPreference
        };
    });

    return <WishlistClient initialWishlist={mappedWishlist} />;
}
