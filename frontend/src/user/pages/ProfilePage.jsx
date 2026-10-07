import ProfileInformation from '../components/profile/ProfileInformation'
import { useProfile } from '../hooks/useProfile'
import { useSubscription } from '../hooks/useSubscription'
import ProfileSkeleton from '../components/profile/ProfileSkeleton'
import SubscriptionCard from '../components/profile/SubscriptionCard'
import SubscriptionEmptyState from '../components/profile/SubscriptionEmptyState'

function ProfilePage() {
    const {
        data: profileResponse,
        isLoading: isProfileLoading,
        isError: isProfileError,
        error: profileError,
    } = useProfile()

    const {
        data: subscriptionResponse,
        isLoading: isSubscriptionLoading,
        isError: isSubscriptionError,
        error: subscriptionError,
    } = useSubscription()

    const profile = profileResponse?.data
    const subscription = subscriptionResponse?.data

    if (isProfileLoading || isSubscriptionLoading) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100" />
                </div>

                <ProfileSkeleton />
            </div>
        )
    }

    if (isProfileError || isSubscriptionError) {
        return (
            <div className="mx-auto max-w-7xl">
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        {profileError?.response?.data?.message ||
                            subscriptionError?.response?.data?.message ||
                            'Gagal memuat profile.'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Profile Saya
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Kelola informasi akun dan langgananmu.
                </p>
            </div>

            <ProfileInformation profile={profile} />

            {subscription ? (
                <SubscriptionCard subscription={subscription} />
            ) : (
                <SubscriptionEmptyState />
            )}
        </div>
    )
}

export default ProfilePage