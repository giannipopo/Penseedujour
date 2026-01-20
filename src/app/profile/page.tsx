import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ProfileView from '@/components/ProfileView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin');
    }

    return <ProfileView userId={user.id} isOwnProfile={true} />;
}
