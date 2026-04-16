import prisma from "@/lib/prisma";
import SearchClient from "@/components/SearchClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
  const city = typeof resolvedSearchParams.city === 'string' ? resolvedSearchParams.city : undefined;

  // Build prisma query — no room status filter so ALL rooms from APPROVED properties show
  // OCCUPIED rooms will be badged as "Fully Booked", not hidden
  let whereClause: any = { property: { status: 'APPROVED' } };
  
  if (q || city) {
      if (city) {
          whereClause.property.city = { contains: city };
      }
      if (q) {
          whereClause.property.OR = [
              { city: { contains: q } },
              { area: { contains: q } },
              { title: { contains: q } },
          ];
      }
  }

  const rooms = await prisma.room.findMany({
      where: whereClause,
      include: { property: true },
      orderBy: { status: 'asc' }, // AVAILABLE before OCCUPIED
  });

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

      return {
          id: room.id,
          image: parsedImages[0] || "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3",
          price: `₹${room.rent.toLocaleString()}/mo`,
          society: room.property.title,
          location: `${room.property.area}, ${room.property.city}`,
          amenities: parsedAmenities,
          type: room.type,
          genderPreference: room.property.genderPreference,
          propertyType: room.property.propertyType,
          // Fixed: use real room fields instead of hardcoded values
          features: {
              beds: room.capacity > 1 ? `${room.capacity} Beds` : '1 Bed',
              baths: room.bathroomType ?? 'Shared',
              area: room.furnishing ?? 'Furnished',
          },
          // Show badge for occupied/unavailable rooms
          badge: room.status === 'OCCUPIED' ? 'FULLY BOOKED'
              : room.status === 'MAINTENANCE' ? 'MAINTENANCE' : undefined,
      };
  });

  return (
    <SearchClient 
        initialRooms={mappedRooms} 
        initialQuery={q || ''} 
        initialCity={city || ''} 
    />
  );
}
