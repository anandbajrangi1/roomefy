import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TenantPortalClient from "@/components/TenantPortalClient";
import AppLayout from "@/components/AppLayout";
import { redirect } from "next/navigation";

export default async function TenantDashboard() {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as { role: string }).role !== 'TENANT') {
        redirect('/login');
    }

    return (
        <AppLayout>
            <div className="pt-24 px-6 min-h-screen bg-slate-50/50">
                <TenantPortalClient />
            </div>
        </AppLayout>
    );
}
