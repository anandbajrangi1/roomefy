"use server";

import prisma from "@/lib/prisma";
import { createNotification } from "./notifications";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail, sendLeaseConfirmationEmail, sendMaintenanceUpdateEmail } from "@/lib/mail";

const getAuthContext = async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return {
        userId: (session.user as any).id,
        role: (session.user as any).role
    };
};

export async function createTenantAccount(data: any) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    
    const { name, email, phone, password } = data;
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("A user with this email already exists");

    const hashedPassword = await bcrypt.hash(password || "Roomefy@2024", 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'TENANT',
            verificationStatus: 'VERIFIED',
            memberNote: 'Account created manually by Admin'
        }
    });

    // Send Welcome Email
    try {
        await sendWelcomeEmail(email, name, password || "Roomefy@2024");
    } catch (err) {
        console.error("Welcome email failed but tenant was created:", err);
    }

    return user;
}

export async function getDashboardStats() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");

    const inquiries = await prisma.inquiry.count();
    const bookings = await prisma.booking.count();
    const revenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
    });
    const signups = await prisma.user.count({ where: { role: 'TENANT' } });

    return {
        inquiries,
        revenue: revenue._sum.amount || 0,
        signups
    };
}

export async function getInquiries() {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    const where = ctx.role === "ADMIN" ? {} : { property: { ownerId: ctx.userId } };

    return prisma.inquiry.findMany({
        where,
        include: { user: true, property: true },
        orderBy: { id: 'desc' }
    });
}

export async function toggleInquirySharing(id: string, isSharedWithOwner: boolean) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.inquiry.update({
        where: { id },
        data: { isSharedWithOwner }
    });
}

export async function getAdminBookings() {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    const where = ctx.role === "ADMIN" ? {} : { room: { property: { ownerId: ctx.userId } } };

    return prisma.booking.findMany({
        where,
        include: { 
            tenant: true,
            room: { include: { property: true } }
        },
        orderBy: { id: 'desc' }
    });
}



export async function getProperties() {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    const where = ctx.role === "ADMIN" ? {} : { ownerId: ctx.userId };

    return prisma.property.findMany({
        where,
        include: {
            owner: true,
            rooms: true
        },
        orderBy: { id: 'desc' }
    });
}

export async function getOwners() {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    if (ctx.role === "OWNER") {
        return prisma.user.findMany({
            where: { id: ctx.userId },
            select: { id: true, name: true, email: true }
        });
    }

    return prisma.user.findMany({
        where: { role: { in: ['OWNER', 'ADMIN'] } },
        select: { id: true, name: true, email: true }
    });
}

export async function createProperty(data: any) {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");
    
    const { title, city, area, address, ownerId, masterRent, masterDeposit, leaseStartDate, leaseEndDate, rooms } = data;

    // Owners can only create property for themselves
    const finalOwnerId = ctx.role === "ADMIN" ? ownerId : ctx.userId;
    
    return prisma.$transaction(async (tx) => {
        const property = await tx.property.create({
            data: {
                title,
                city,
                area,
                address,
                ownerId: finalOwnerId,
                masterRent: masterRent ? parseInt(masterRent) : null,
                masterDeposit: masterDeposit ? parseInt(masterDeposit) : null,
                leaseStartDate,
                leaseEndDate,
                status: 'APPROVED'
            }
        });

        if (rooms && rooms.length > 0) {
            for (const room of rooms) {
                await tx.room.create({
                    data: {
                        propertyId: property.id,
                        type: room.type,
                        rent: parseInt(room.rent || '0') || 0,
                        deposit: parseInt(room.deposit || '0') || 0,
                        amenities: JSON.stringify(room.amenities || []),
                        images: JSON.stringify(room.images || []),
                        status: 'AVAILABLE'
                    }
                });
            }
        }
        
        return property;
    });
}

export async function updatePropertyStatus(id: string, status: string) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.property.update({
        where: { id },
        data: { status }
    });
}

export async function deleteProperty(id: string) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.$transaction(async (tx) => {
        // Find all rooms in the property
        const rooms = await tx.room.findMany({ where: { propertyId: id } });
        const roomIds = rooms.map(r => r.id);

        // Delete explicit dependent relations on Rooms
        if (roomIds.length > 0) {
            await tx.wishlist.deleteMany({ where: { roomId: { in: roomIds } } });
            await tx.booking.deleteMany({ where: { roomId: { in: roomIds } } });
        }
        
        // Delete explicit dependent relations on Property
        await tx.inquiry.deleteMany({ where: { propertyId: id } });
        await tx.complaint.deleteMany({ where: { propertyId: id } });
        await tx.procurement.deleteMany({ where: { propertyId: id } });
        await tx.employee.deleteMany({ where: { propertyId: id } });
        await tx.expense.deleteMany({ where: { propertyId: id } });
        
        // Finally delete the rooms themselves
        await tx.room.deleteMany({ where: { propertyId: id } });

        // Delete the Property
        return tx.property.delete({ where: { id } });
    });
}

export async function updatePropertyDetails(id: string, data: any) {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    // Check ownership if OWNER
    if (ctx.role === "OWNER") {
        const prop = await prisma.property.findUnique({ where: { id } });
        if (!prop || prop.ownerId !== ctx.userId) throw new Error("Unauthorized");
    }
    return prisma.property.update({
        where: { id },
        data: {
            ...data,
            masterRent: data.masterRent ? parseInt(data.masterRent as string) : null,
            masterDeposit: data.masterDeposit ? parseInt(data.masterDeposit as string) : null,
        }
    });
}

export async function addRoom(propertyId: string, data: any) {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    if (ctx.role === "OWNER") {
        const prop = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!prop || prop.ownerId !== ctx.userId) throw new Error("Unauthorized");
    }
    return prisma.room.create({
        data: {
            ...data,
            propertyId,
            amenities: data.amenities || '[]',
            images: data.images || '[]',
            status: 'AVAILABLE'
        }
    });
}

export async function deleteRoom(id: string) {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    if (ctx.role === "OWNER") {
        const room = await prisma.room.findUnique({ where: { id }, include: { property: true } });
        if (!room || room.property.ownerId !== ctx.userId) throw new Error("Unauthorized");
    }
    return prisma.$transaction(async (tx) => {
        await tx.wishlist.deleteMany({ where: { roomId: id } });
        await tx.booking.deleteMany({ where: { roomId: id } });
        return tx.room.delete({ where: { id } });
    });
}

export async function updateRoomStatus(id: string, status: string) {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    if (ctx.role === "OWNER") {
        const room = await prisma.room.findUnique({ where: { id }, include: { property: true } });
        if (!room || room.property.ownerId !== ctx.userId) throw new Error("Unauthorized");
    }
    return prisma.room.update({
        where: { id },
        data: { status }
    });
}

export async function getComplaints() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.complaint.findMany({
        include: {
            tenant: true,
            property: true,
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateComplaintStatus(id: string, status: string, adminNote?: string) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    const complaint = await prisma.complaint.update({
        where: { id },
        data: { 
            status,
            adminNote: adminNote || undefined
        },
        include: { tenant: true, property: true }
    });

    // Notify Tenant
    await createNotification(
        complaint.tenantId,
        `Complaint ${status.replace('_', ' ')}`,
        adminNote 
            ? `Update: ${adminNote}`
            : `Your complaint regarding property ${complaint.property.title} is now ${status.toLowerCase().replace('_', ' ')}.`,
        status === 'RESOLVED' ? 'SUCCESS' : 'INFO'
    );

    // Notify Tenant via Email
    try {
        await sendMaintenanceUpdateEmail(complaint.tenant.email, complaint.tenant.name, complaint.title, status);
    } catch (err) {
        console.error("Maintenance update email failed:", err);
    }

    return complaint;
}

export async function getPendingUsers() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.user.findMany({
        where: { 
            role: { in: ['TENANT', 'OWNER'] },
            verificationStatus: { in: ['PENDING', 'REJECTED'] }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getProcurements() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.procurement.findMany({
        include: { property: true },
        orderBy: { purchaseDate: 'desc' }
    });
}

export async function addProcurement(data: any) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.procurement.create({
        data: {
            ...data,
            quantity: parseInt(data.quantity || '1'),
            unitPrice: parseInt(data.unitPrice || '0'),
        }
    });
}

export async function updateProcurementStatus(id: string, status: string) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.procurement.update({
        where: { id },
        data: { status }
    });
}

export async function getEmployees() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.employee.findMany({
        include: { property: true },
        orderBy: { joiningDate: 'desc' }
    });
}

export async function addEmployee(data: any) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.employee.create({
        data: {
            ...data,
            salary: parseInt(data.salary || '0'),
        }
    });
}

export async function updateEmployeeStatus(id: string, status: string) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.employee.update({
        where: { id },
        data: { status }
    });
}

export async function getExpenses() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.expense.findMany({
        include: { property: true },
        orderBy: { date: 'desc' }
    });
}

export async function addExpense(data: any) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.expense.create({
        data: {
            ...data,
            amount: parseInt(data.amount || '0'),
        }
    });
}

export async function updateExpenseStatus(id: string, status: string) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.expense.update({
        where: { id },
        data: { status }
    });
}

export async function verifyUser(id: string, status: string, note?: string) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    const user = await prisma.user.update({
        where: { id },
        data: { 
            verificationStatus: status,
            memberNote: note
        }
    });

    // Notify Tenant
    await createNotification(
        id,
        status === 'VERIFIED' ? "Account Verified!" : "Verification Update",
        status === 'VERIFIED' 
            ? "Congratulations! Your account has been verified. You can now explore premium rooms."
            : `Your verification status has been updated to ${status}. Note: ${note || 'No additional notes.'}`,
        status === 'VERIFIED' ? 'SUCCESS' : 'WARNING'
    );

    return user;
}

export async function getAnalyticsData() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    
    const [totalRooms, occupiedRooms, totalRevenue, totalExpenses, totalTenants, recentTenants, recentInquiries, allRooms] = await Promise.all([
        prisma.room.count(),
        prisma.room.count({ where: { status: 'OCCUPIED' } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
        prisma.expense.aggregate({ _sum: { amount: true } }),
        prisma.user.count({ where: { role: 'TENANT' } }),
        prisma.user.findMany({
            where: { role: 'TENANT' },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { 
                bookings: { 
                    take: 1, 
                    where: { status: 'ACTIVE' },
                    include: { room: { include: { property: true } } } 
                } 
            }
        }),
        prisma.inquiry.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { property: true }
        }),
        prisma.room.findMany({
            select: { type: true, status: true }
        })
    ]);

    // Inventory Matrix
    const inventoryMatrix = allRooms.reduce((acc: any, room) => {
        if (!acc[room.type]) acc[room.type] = { type: room.type, total: 0, occupied: 0 };
        acc[room.type].total++;
        if (room.status === 'OCCUPIED') acc[room.type].occupied++;
        return acc;
    }, {});

    return {
        totalRooms,
        occupiedRooms,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        totalTenants,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        recentTenants,
        recentInquiries,
        inventoryMatrix: Object.values(inventoryMatrix)
    };
}

export async function getPropertyPerformance() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    
    const properties = await prisma.property.findMany({
        include: {
            rooms: true,
            expenses: true,
        }
    });

    return properties.map(p => {
        const totalRooms = p.rooms.length;
        const occupiedRooms = p.rooms.filter(r => r.status === 'OCCUPIED').length;
        const totalExpenses = p.expenses.reduce((sum, e) => sum + e.amount, 0);
        
        return {
            id: p.id,
            title: p.title,
            city: p.city,
            occupancy: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
            expenses: totalExpenses,
        };
    });
}

export async function generateExportData(type: string) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    
    switch(type) {
        case 'BOOKINGS':
            return prisma.booking.findMany({ include: { tenant: true, room: { include: { property: true } } } });
        case 'EXPENSES':
            return prisma.expense.findMany({ include: { property: true } });
        case 'TENANTS':
            return prisma.user.findMany({ where: { role: 'TENANT' } });
        default:
            return [];
    }
}

export async function getAllRoomsAdmin() {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    const where = ctx.role === "ADMIN" ? {} : { property: { ownerId: ctx.userId } };

    return prisma.room.findMany({
        where,
        include: {
            property: true,
            bookings: {
                include: { tenant: true },
                where: { status: { in: ['CONFIRMED', 'PENDING'] } }
            }
        },
        orderBy: { propertyId: 'asc' }
    });
}

export async function updateRoomAdvanced(id: string, data: any) {
    const ctx = await getAuthContext();
    if (!ctx) throw new Error("Unauthorized");

    if (ctx.role === "OWNER") {
        const room = await prisma.room.findUnique({ where: { id }, include: { property: true } });
        if (!room || room.property.ownerId !== ctx.userId) throw new Error("Unauthorized");
    }
    return prisma.room.update({
        where: { id },
        data: {
            bathroomType: data.bathroomType,
            hasBalcony: data.hasBalcony,
            roomCategory: data.roomCategory,
            furnishing: data.furnishing,
            capacity: parseInt(data.capacity || '1'),
            rent: parseInt(data.rent || '0'),
            deposit: parseInt(data.deposit || '0'),
            status: data.status,
            type: data.type,
            images: data.images
        }
    });
}

export async function getActiveTenants() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.user.findMany({
        where: { 
            role: 'TENANT',
            verificationStatus: 'VERIFIED'
        },
        include: {
            bookings: {
                where: { status: { in: ['CONFIRMED', 'ACTIVE'] } },
                include: {
                    room: { include: { property: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getAvailableRooms() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.room.findMany({
        where: { status: 'AVAILABLE' },
        include: { property: true },
        orderBy: { propertyId: 'asc' }
    });
}

export async function assignTenantToRoom(tenantId: string, roomId: string, data: any) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");

    return prisma.$transaction(async (tx) => {
        // Create Booking
        const booking = await tx.booking.create({
            data: {
                tenantId,
                roomId,
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                lockedRentAmount: parseInt(data.lockedRentAmount?.toString() || '0'),
                depositHolding: parseInt(data.depositHolding?.toString() || '0'),
                status: 'ACTIVE'
            }
        });

        // Update Room status
        await tx.room.update({
            where: { id: roomId },
            data: { status: 'OCCUPIED' }
        });

        return booking;
    });
}

export async function finalizeAssignmentAndNotify(tenantId: string, roomId: string, data: any) {
    const booking = await assignTenantToRoom(tenantId, roomId, data);
    
    // Fetch details for email
    const tenant = await prisma.user.findUnique({ where: { id: tenantId } });
    const room = await prisma.room.findUnique({ 
        where: { id: roomId },
        include: { property: true }
    });

    if (tenant && room) {
        try {
            await sendLeaseConfirmationEmail(tenant.email, tenant.name, room.property.title, room.type);
        } catch (err) {
            console.error("Lease confirmation email failed:", err);
        }
    }

    return booking;
}

export async function updateTenantLease(bookingId: string, data: any) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    return prisma.booking.update({
        where: { id: bookingId },
        data: {
            leaseLockInEnd: data.leaseLockInEnd ? new Date(data.leaseLockInEnd) : null,
            noticeDate: data.noticeDate ? new Date(data.noticeDate) : null,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : new Date(),
            policeVerificationUrl: data.policeVerificationUrl || null,
            rentAgreementUrl: data.rentAgreementUrl || null,
            lockedRentAmount: parseInt(data.lockedRentAmount?.toString() || '0'),
            depositHolding: parseInt(data.depositHolding?.toString() || '0'),
            status: data.status
        }
    });
}

export async function generateMonthlyInvoices() {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");
    
    // Get all active bookings
    const activeBookings = await prisma.booking.findMany({
        where: { status: { in: ['ACTIVE', 'CONFIRMED'] } },
        include: { tenant: true, room: { include: { property: true } } }
    });

    const now = new Date();
    const currentMonthLabel = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    let createdCount = 0;
    let skippedCount = 0;

    for (const booking of activeBookings) {
        // Check if invoice already exists for this month
        const existing = await prisma.payment.findFirst({
            where: {
                bookingId: booking.id,
                dueDate: currentMonthLabel
            }
        });

        if (existing) {
            skippedCount++;
            continue;
        }

        const amount = booking.lockedRentAmount > 0 ? booking.lockedRentAmount : booking.room.rent;

        await prisma.payment.create({
            data: {
                bookingId: booking.id,
                tenantId: booking.tenantId,
                amount: amount,
                dueDate: currentMonthLabel,
                status: 'PENDING'
            }
        });

        // Notify Tenant
        await createNotification(
            booking.tenantId,
            "New Rent Invoice Generated",
            `Your rent invoice for ${currentMonthLabel} of ₹${amount.toLocaleString()} has been generated for ${booking.room.property.title}.`,
            'INFO'
        );

        createdCount++;
    }

    return { createdCount, skippedCount, month: currentMonthLabel };
}

export async function verifyTenantDocuments(tenantId: string, status: string, note?: string) {
    const ctx = await getAuthContext();
    if (!ctx || ctx.role !== "ADMIN") throw new Error("Unauthorized");

    const user = await prisma.user.update({
        where: { id: tenantId },
        data: {
            verificationStatus: status,
            memberNote: note || 'Document verification updated by Admin.'
        }
    });

    await createNotification(
        tenantId,
        status === 'VERIFIED' ? "Documents Verified!" : "Verification Update",
        status === 'VERIFIED' 
            ? "Your legal documents have been verified successfully. Your account is now fully compliant."
            : `Your verification status was updated to ${status}. Admin Note: ${note || 'No additional notes.'}`,
        status === 'VERIFIED' ? 'SUCCESS' : 'WARNING'
    );

    return user;
}

