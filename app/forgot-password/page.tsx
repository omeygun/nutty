"use client"
import dynamic from 'next/dynamic'
import ForgotPasswordForm from '@/components/auth/ForgotPassword'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">Login to your Nutty account to continue</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

