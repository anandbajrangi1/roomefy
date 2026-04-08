import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import MyBookingsClient from "@/components/MyBookingsClient";
import { redirect } from "next/navigation";

export default async function TenantBookings() {
    redirect('/'); 
}
