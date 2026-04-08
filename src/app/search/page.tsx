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

  // Build prisma query
  let whereClause: any = { status: 'AVAILABLE', property: { status: 'APPROVED' } };
  
  if (q || city) {
      if (city) {
          whereClause.property.city = { contains: city };
      }
      if (q) {
          // If query present, search in area or title or city
          whereClause.property.OR = [
              { city: { contains: q } },
              { area: { contains: q } },
              { title: { contains: q } },
          ];
      }
  }

  const rooms = await prisma.room.findMany({
      where: whereClause,
      include: { property: true }
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
          features: { beds: room.type.includes('1BHK') ? 1 : 'Shared', baths: 1, area: "180 sq.ft" }
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
