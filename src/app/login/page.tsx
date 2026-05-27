import { LoginForm } from "@/components/auth/login-form";
import { Car, Shield, Zap, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gray-950 p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.08),_transparent_60%)]" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">
              Car<span className="text-blue-400">Safe</span>
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Your Vehicle&apos;s
              <br />
              <span className="text-blue-400">Digital Passport</span>
            </h2>
            <p className="mt-4 text-gray-400 text-lg leading-relaxed max-w-sm">
              The trusted platform connecting owners, dealers, and insurers
              through verified vehicle history.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Shield,
                title: "Tamper-proof records",
                desc: "Blockchain-backed service history you can trust",
              },
              {
                icon: Zap,
                title: "AI-powered insights",
                desc: "Predictive maintenance and fuel analysis",
              },
              {
                icon: Lock,
                title: "Consent-based access",
                desc: "You control who sees your vehicle data",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-gray-600 text-xs">
            © 2025 CarSafe · Secure Vehicle Intelligence Platform
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-8">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Car<span className="text-blue-600">Safe</span>
          </span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your CarSafe account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
