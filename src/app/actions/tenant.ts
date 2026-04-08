"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getTenantSession() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'TENANT') {
        throw new Error("Unauthorized: Tenant access only");
    }
    return session;
}

export async function getTenantActiveLease() {
    const session = await getTenantSession();
    
    return prisma.booking.findFirst({
        where: {
            tenantId: (session.user as any).id,
            status: { in: ['ACTIVE', 'SERVED_NOTICE', 'PENDING', 'CONFIRMED'] }
        },
        include: {
            room: {
                include: {
                    property: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function submitMaintenanceRequest(data: { title: string, description: string, category: string, priority: string, attachmentUrl?: string }) {
    const session = await getTenantSession();
    
    // Find active booking to get propertyId
    const activeLease = await prisma.booking.findFirst({
        where: {
            tenantId: (session.user as any).id,
            status: { in: ['ACTIVE', 'SERVED_NOTICE'] }
        }
    });

    if (!activeLease) throw new Error("No active lease found to attach complaint");

    const room = await prisma.room.findUnique({
        where: { id: activeLease.roomId }
    });

    if (!room) throw new Error("Room reference lost");

    return prisma.complaint.create({
        data: {
            tenantId: (session.user as any).id,
            propertyId: room.propertyId,
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            attachmentUrl: data.attachmentUrl || null,
            status: 'OPEN'
        }
    });
}

export async function getTenantComplaints() {
    const session = await getTenantSession();
    return prisma.complaint.findMany({
        where: { tenantId: (session.user as any).id },
        orderBy: { createdAt: 'desc' },
        include: { property: true }
    });
}

export async function getTenantLedger() {
    const session = await getTenantSession();
    return prisma.payment.findMany({
        where: { tenantId: (session.user as any).id },
        orderBy: { dueDate: 'desc' }
    });
}

export async function updateBookingDocuments(bookingId: string, data: { rentAgreementUrl?: string, policeVerificationUrl?: string }) {
    const session = await getTenantSession();
    
    // Safety check: Ensure the booking belongs to this tenant
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking || booking.tenantId !== (session.user as any).id) {
        throw new Error("Unauthorized document update");
    }

    return prisma.booking.update({
        where: { id: bookingId },
        data: {
            rentAgreementUrl: data.rentAgreementUrl || booking.rentAgreementUrl,
            policeVerificationUrl: data.policeVerificationUrl || booking.policeVerificationUrl
        }
    });
}
