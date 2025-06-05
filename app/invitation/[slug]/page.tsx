import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { FriendAccept } from "@/components/friendAcceptForm"

export default async function LoginPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {

    const { slug } = await params

    return (

        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {/* handle accept or reject */}
                <FriendAccept senderId={slug}></FriendAccept>
                {/* <ForgotPasswordForm /> */}
            </div>
        </div>
    )
}

