import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign up for Nutty to start coordinating schedules with your friends
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}

