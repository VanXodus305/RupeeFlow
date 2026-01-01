"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Card, CardBody } from "@heroui/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // Check if login was successful
      if (result?.error || !result?.ok) {
        setError("Invalid credentials");
        setIsLoading(false);
        return;
      }

      // Demo users have roles, so redirect to their dashboard
      router.push(
        email === "operator@example.com"
          ? "/station-dashboard"
          : "/ev-owner-dashboard"
      );
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // NextAuth's signIn with redirect: true will handle the OAuth flow
    // and the browser will follow the redirect
    // Middleware will check the session and redirect to role-selection if needed
    await signIn("google", { redirect: true });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px- sm:px-6 py-20 lg:py-24 overflow-hidden">
      {/* Darker gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-200 via-background-100/30 to-background-200 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto w-full space-y-6 px-8 relative z-10">
        {/* Heading Section */}
        <div className="text-center space-y-2">
          <h1
            className="text-5xl sm:text-6xl lg:text-6xl font-bold tracking-tight"
            style={{ fontFamily: "Conthrax, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Login
            </span>
          </h1>
          <p className="text-lg text-foreground/70">Welcome back</p>
        </div>

        {/* Centered Login Form */}
        <div className="flex justify-center">
          <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 backdrop-blur-xl w-full max-w-md">
            <CardBody className="space-y-6 p-8">
              {error && (
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Demo Login Form */}
              <form onSubmit={handleDemoLogin} className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Demo Login</h2>

                <Input
                  type="email"
                  label="Email Address"
                  placeholder="owner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  classNames={{
                    input: "bg-background-200/50 text-foreground",
                    label: "text-foreground/70",
                    mainWrapper: "text-foreground",
                  }}
                  variant="bordered"
                  description="Try: owner@example.com or operator@example.com"
                />

                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  classNames={{
                    input: "bg-background-200/50 text-foreground",
                    label: "text-foreground/70",
                    mainWrapper: "text-foreground",
                  }}
                  variant="bordered"
                  description="Default: password123"
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold text-lg py-6 hover:shadow-lg hover:shadow-primary/50 transition-all duration-200"
                  radius="full"
                >
                  {isLoading ? "Signing in..." : "Sign In with Demo"}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-primary/20"></div>
                <span className="text-foreground/50 text-sm">OR</span>
                <div className="flex-1 h-px bg-primary/20"></div>
              </div>

              {/* Google Login */}
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="bordered"
                className="w-full border-2 border-primary/40 text-foreground font-semibold text-lg py-6 hover:bg-primary/10 transition-all duration-200 group"
                radius="full"
              >
                <span>🔗</span>
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Button>

              <p className="text-center text-foreground/50 text-sm">
                First-time Google users will select their role after signing in
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Feature Highlights - Horizontal Layout */}
        <div className="flex flex-wrap justify-center gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-primary/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 w-full sm:w-80">
            <div className="text-primary text-2xl font-bold mb-2">⚡</div>
            <h3 className="text-foreground font-semibold mb-1">
              Real-time Settlement
            </h3>
            <p className="text-foreground/60 text-sm">
              Instant blockchain-based transactions
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-primary/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 w-full sm:w-80">
            <div className="text-secondary text-2xl font-bold mb-2">🔒</div>
            <h3 className="text-foreground font-semibold mb-1">
              Secure & Transparent
            </h3>
            <p className="text-foreground/60 text-sm">
              Blockchain-verified transactions
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-primary/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 w-full sm:w-80">
            <div className="text-primary text-2xl font-bold mb-2">💳</div>
            <h3 className="text-foreground font-semibold mb-1">
              Pay As You Use
            </h3>
            <p className="text-foreground/60 text-sm">
              No hidden charges or fees
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
