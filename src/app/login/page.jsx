"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/ev-owner-dashboard");
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", {
      redirect: true,
      callbackUrl: "/ev-owner-dashboard",
    });
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
      <h1>RupeeFlow Login</h1>

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        🔐 Sign in with Google
      </button>

      <hr style={{ margin: "20px 0", color: "#ccc" }} />
      <p style={{ textAlign: "center", color: "#666" }}>
        Or use demo credentials below
      </p>
      <hr style={{ margin: "20px 0", color: "#ccc" }} />

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          style={{ width: "100%", padding: "10px" }}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <h3>Demo Accounts:</h3>
      <p>
        <strong>EV Owner:</strong> owner@example.com / password123
      </p>
      <p>
        <strong>Station Operator:</strong> operator@example.com / password123
      </p>
    </div>
  );
}
