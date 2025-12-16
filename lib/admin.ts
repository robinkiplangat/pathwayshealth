import { currentUser } from '@clerk/nextjs/server';

export async function isAdmin() {
    const user = await currentUser();

    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
        return false;
    }

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = user.emailAddresses[0].emailAddress.toLowerCase();

    return adminEmails.includes(userEmail);
}
