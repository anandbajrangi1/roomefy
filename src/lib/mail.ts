import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY || '',
    apiSecret: process.env.MAILJET_SECRET_KEY || ''
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.MAIL_FROM || 'no-reply@roomefy.com';

export async function sendEmail({ to, subject, html, text }: { to: string, subject: string, html: string, text?: string }) {
    try {
        const result = await mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: FROM_EMAIL,
                            Name: 'Roomefy Operations'
                        },
                        To: [
                            {
                                Email: to
                            }
                        ],
                        Subject: subject,
                        TextPart: text || subject,
                        HTMLPart: html
                    }
                ]
            });
        return result.body;
    } catch (err) {
        console.error("Mailjet Error:", err);
        throw new Error("Failed to send email");
    }
}

export async function sendWelcomeEmail(email: string, name: string, password: string) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
            <h1 style="color: #e11d48; margin-bottom: 24px;">Welcome to Roomefy, ${name}!</h1>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">Your tenant account has been successfully created by our administration team. You can now log in to manage your stay, view your lease, and raise maintenance requests.</p>
            
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin: 32px 0;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Your Login Credentials</p>
                <p style="font-size: 18px; margin: 12px 0 0 0;"><strong>User ID:</strong> ${email}</p>
                <p style="font-size: 18px; margin: 8px 0 0 0;"><strong>Password:</strong> ${password}</p>
            </div>

            <a href="${APP_URL}/login" style="display: inline-block; background: #0f172a; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 24px;">Log In to Tenant Dashboard</a>
            
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 40px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Roomefy Operations &mdash; Premium Co-Living Management</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: "Welcome to Roomefy - Your Tenant Account is Ready",
        html
    });
}

export async function sendLeaseConfirmationEmail(email: string, name: string, propertyTitle: string, roomType: string) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
            <h2 style="color: #0f172a;">Room Assignment Confirmed 🏠</h2>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">Hello ${name}, great news! You have been officially assigned to a room at <strong>${propertyTitle}</strong>.</p>
            
            <div style="border-left: 4px solid #e11d48; padding: 16px 24px; background: #fff1f2; margin: 24px 0;">
                <p style="margin: 0; font-weight: bold; color: #e11d48;">${roomType} Room</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #be123c;">Your lease is now active. You can view your Rent Agreement and Police Verification status in your dashboard.</p>
            </div>

            <a href="${APP_URL}/dashboard/tenant" style="display: inline-block; background: #0f172a; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px;">View My Dashboard</a>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: `Room Assigned: ${propertyTitle}`,
        html
    });
}

export async function sendMaintenanceUpdateEmail(email: string, name: string, ticketTitle: string, status: string) {
    const color = status === 'RESOLVED' ? '#10b981' : '#f59e0b';
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
            <h3 style="color: #0f172a;">Maintenance Update: ${ticketTitle}</h3>
            <p style="font-size: 16px; color: #475569;">Hello ${name}, the status of your maintenance request has been updated.</p>
            
            <div style="display: inline-block; background: ${color}; color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 12px; text-transform: uppercase;">
                ${status}
            </div>

            <p style="margin-top: 24px; font-size: 14px; color: #64748b;">Our team is working to ensure you have a comfortable stay. Log in to your portal to see more details.</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: `[Update] Maintenance Request: ${ticketTitle}`,
        html
    });
}

export async function sendOtpEmail(email: string, code: string) {
    const html = `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; text-align: center;">
            <div style="background: #fff1f2; width: 64px; hieght: 64px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                <span style="font-size: 32px;">🔐</span>
            </div>
            <h2 style="color: #0f172a; margin-bottom: 8px; font-weight: 900;">Verify Your Email</h2>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 32px;">Please use the 6-digit code below to complete your registration on Roomefy.</p>
            
            <div style="background: #f8fafc; border: 2px dashed #e2e8f0; padding: 20px; border-radius: 16px; margin-bottom: 32px;">
                <span style="font-size: 36px; font-weight: 900; letter-spacing: 0.2em; color: #e11d48;">${code}</span>
            </div>

            <p style="color: #94a3b8; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;">
            <p style="font-size: 11px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold;">Secure Verification by Roomefy</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: `${code} is your Roomefy verification code`,
        html
    });
}
