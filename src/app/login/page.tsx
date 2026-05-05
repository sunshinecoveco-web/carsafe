import { LoginForm } from '@/components/auth/login-form';
import Logo from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h1>
          <p className="mt-2 text-muted-foreground">
            Access your vehicle information portal
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
