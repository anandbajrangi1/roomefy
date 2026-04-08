import prisma from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
    // Fetch rooms and their properties from SQLite via Prisma
    const rooms = await prisma.room.findMany({
        where: { status: 'AVAILABLE', property: { status: 'APPROVED' } },
        include: { property: true },
        take: 8
    });

    const allAmenities = new Set<string>();

    const mappedRooms = rooms.map(room => {
        let parsedImages = [];
        try { parsedImages = JSON.parse(room.images); } catch (e) {}

        let parsedAmenities: string[] = [];
        try { parsedAmenities = JSON.parse(room.amenities); } 
        catch (e) {
             if (typeof room.amenities === 'string') {
                 parsedAmenities = room.amenities.split(',').map(s=>s.trim()).filter(Boolean);
             }
        }
        parsedAmenities.forEach(a => allAmenities.add(a));

        return {
            id: room.id,
            image: parsedImages[0] || "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3",
            price: `₹${room.rent.toLocaleString()}/mo`,
            society: room.property.title,
            location: `${room.property.area}, ${room.property.city}`,
            amenities: parsedAmenities,
            type: room.type,
            features: { beds: room.type.includes('1BHK') ? 1 : 'Shared', baths: 1, area: "180 sq.ft" }
        };
    });

    const featuredProperties = mappedRooms.slice(0, 4);
    const nearbyProperties = mappedRooms.slice(4, 8); // Uses remaining, or empty if db is small
    const uniqueAmenities = Array.from(allAmenities);

    return <HomeClient featuredProperties={featuredProperties} nearbyProperties={nearbyProperties} uniqueAmenities={uniqueAmenities} />;
}
