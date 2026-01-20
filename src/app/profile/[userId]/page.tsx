import { getCurrentUser } from '@/lib/auth';
import ProfileView from '@/components/ProfileView';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const currentUser = await getCurrentUser();
    const { userId } = await params;

    if (!currentUser) {
        redirect('/auth/signin');
    }

    const isOwnProfile = currentUser.id === userId;

    return <ProfileView userId={userId} isOwnProfile={isOwnProfile} />;
}
