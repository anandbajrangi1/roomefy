import prisma from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ─── BUG FIX: SEO metadata (was completely missing) ───────────────────────────
export const metadata: Metadata = {
    title: "Roomefy — Find Premium PG & Co-Living Spaces",
    description:
        "Discover verified PG accommodations, co-living spaces, and managed rooms with zero brokerage. Fully furnished rooms with WiFi, meals, and flexible stays across Bangalore, Mumbai, Pune & more.",
    keywords: ["PG accommodation", "co-living", "managed rooms", "PG Bangalore", "paying guest"],
    openGraph: {
        title: "Roomefy — Find Premium PG & Co-Living Spaces",
        description:
            "Verified PG rooms with WiFi, meals, and flexible stays. Zero brokerage, no hidden charges.",
        type: "website",
        locale: "en_IN",
    },
    twitter: {
        card: "summary_large_image",
        title: "Roomefy — Premium PG & Co-Living",
        description: "Verified PG rooms. Zero brokerage. Move-in ready.",
    },
};

export default async function Home() {
    // ─── BUG FIX: Fetch more rooms so nearbyProperties isn't empty ──────────
    // Show ALL rooms from APPROVED properties — OCCUPIED rooms are badged "FULLY BOOKED",
    // not hidden. Prospective tenants can still see them and enquire.
    const rooms = await prisma.room.findMany({
        where: { property: { status: "APPROVED" } },
        include: { property: true },
        take: 20,
        orderBy: { status: "asc" }, // AVAILABLE rooms sort first
    });

    const allAmenities = new Set<string>();

    const mappedRooms = rooms.map((room) => {
        let parsedImages: string[] = [];
        try { parsedImages = JSON.parse(room.images); } catch {}

        let parsedAmenities: string[] = [];
        try { parsedAmenities = JSON.parse(room.amenities); }
        catch {
            if (typeof room.amenities === "string") {
                parsedAmenities = room.amenities.split(",").map((s) => s.trim()).filter(Boolean);
            }
        }
        parsedAmenities.forEach((a) => allAmenities.add(a));

        // ─── BUG FIX 1: Use real Room fields instead of hardcoded values ──
        const bedsLabel = room.capacity > 1 ? `${room.capacity} Beds` : "1 Bed";
        const bathLabel = room.bathroomType ?? "Shared";
        // Use furnishing level as the 3rd feature (room has no area field)
        const furnishLabel = room.furnishing ?? "Furnished";

        // ─── BUG FIX 2: Include genderPreference + propertyType ──────────
        return {
            id: room.id,
            image:
                parsedImages[0] ||
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3",
            price: `₹${room.rent.toLocaleString()}/mo`,
            society: room.property.title,
            location: `${room.property.area}, ${room.property.city}`,
            amenities: parsedAmenities,
            type: room.type,
            capacity: room.capacity,
            furnishing: room.furnishing,
            genderPreference: room.property.genderPreference,
            propertyType: room.property.propertyType,
            features: { beds: room.capacity > 1 ? `${room.capacity} Beds` : '1 Bed', baths: room.bathroomType ?? 'Shared', area: room.furnishing ?? 'Furnished' },
            // OCCUPIED rooms get a badge, not hidden
            badge: room.status === 'OCCUPIED' ? 'FULLY BOOKED' : room.status === 'MAINTENANCE' ? 'MAINTENANCE' : undefined,
        };
    });

    const featuredProperties = mappedRooms.slice(0, 4);
    // ─── BUG FIX 3: More rooms instead of fake "nearby" ─────────────────
    const moreProperties = mappedRooms.slice(4, 8);
    const uniqueAmenities = Array.from(allAmenities);

    return (
        <HomeClient
            featuredProperties={featuredProperties}
            moreProperties={moreProperties}
            uniqueAmenities={uniqueAmenities}
        />
    );
}
