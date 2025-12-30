"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Welcome to RupeeFlow
      </h1>

      {error && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            backgroundColor: "#fee",
            border: "1px solid #f99",
            borderRadius: "4px",
            color: "#c33",
          }}
        >
          {error}
        </div>
      )}

      {/* Demo Login */}
      <form onSubmit={handleDemoLogin}>
        <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>Demo Login</h2>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "500",
            }}
          >
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
          <small style={{ color: "#666" }}>
            Try: owner@example.com or operator@example.com
          </small>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "500",
            }}
          >
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
          <small style={{ color: "#666" }}>Default: password123</small>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          {isLoading ? "Logging in..." : "Login with Demo"}
        </button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      {/* Google Login */}
      <div>
        <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>
          Or continue with Google
        </h2>
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#f1f1f1",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>🔗</span>
          {isLoading ? "Signing in..." : "Continue with Google"}
        </button>
        <small style={{ display: "block", marginTop: "10px", color: "#666" }}>
          First-time Google users will select their role after signing in
        </small>
      </div>
    </div>
  );
}
