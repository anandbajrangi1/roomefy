/**
 * amenityIcons.ts
 * Shared utility for mapping amenity names → Font Awesome icon classes.
 * Imported by HomeClient, RoomDetailClient, SearchClient, etc.
 */

export const getAmenityIcon = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('furnish'))               return 'fa-couch';
    if (n.includes('gym'))                   return 'fa-dumbbell';
    if (n.includes('pool'))                  return 'fa-swimming-pool';
    if (n.includes('clubhouse'))             return 'fa-building';
    if (n.includes('security'))              return 'fa-shield-alt';
    if (n.includes('park') || n.includes('garden'))   return 'fa-tree';
    if (n.includes('parking') || n.includes('car'))   return 'fa-car';
    if (n.includes('wifi'))                  return 'fa-wifi';
    if (n.includes('ac') || n.includes('air condition')) return 'fa-snowflake';
    if (n.includes('washroom') || n.includes('bath')) return 'fa-bath';
    if (n.includes('balcony'))               return 'fa-cloud-sun';
    if (n.includes('laundry') || n.includes('machine')) return 'fa-tshirt';
    if (n.includes('tv') || n.includes('television')) return 'fa-tv';
    if (n.includes('water'))                 return 'fa-tint';
    return 'fa-check-circle';
};

export interface AmenityItem {
    name: string;
    icon: string;
}

/** Fallback amenities shown when the DB has no amenity data */
export const DEFAULT_AMENITIES: AmenityItem[] = [
    { name: 'Fully Furnished Rooms', icon: 'fa-couch' },
    { name: 'Free Gym Access',        icon: 'fa-dumbbell' },
    { name: 'Swimming Pool',          icon: 'fa-swimming-pool' },
    { name: 'Clubhouse Access',       icon: 'fa-building' },
    { name: '24/7 Security',          icon: 'fa-shield-alt' },
    { name: 'Park & Garden Area',     icon: 'fa-tree' },
    { name: 'Parking Space',          icon: 'fa-car' },
];
