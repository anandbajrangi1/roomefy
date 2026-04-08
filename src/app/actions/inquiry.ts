'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export interface InquiryPayload {
    propertyId: string;
    roomId?: string;
    name: string;
    phone: string;
    message?: string;
}

export async function submitInquiry(payload: InquiryPayload): Promise<{ success: boolean; error?: string }> {
    try {
        const { propertyId, roomId, name, phone, message } = payload;

        if (!name.trim() || !phone.trim()) {
            return { success: false, error: 'Name and phone are required.' };
        }

        if (!/^[+]?[\d\s\-()]{7,15}$/.test(phone.trim())) {
            return { success: false, error: 'Please enter a valid phone number.' };
        }

        // Check if property exists
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) return { success: false, error: 'Property not found.' };

        // Attach userId if logged in
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id ?? null;

        await prisma.inquiry.create({
            data: {
                propertyId,
                roomId: roomId ?? null,
                name: name.trim(),
                phone: phone.trim(),
                message: message?.trim() || null,
                userId: userId ?? null,
                status: 'NEW',
            },
        });

        return { success: true };
    } catch (err: any) {
        console.error('[submitInquiry]', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}
