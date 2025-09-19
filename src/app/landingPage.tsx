"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const goToLogin = () => {
    router.push("/login");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "2rem",
        backgroundColor: "#f5f5f5",
      }}
    >
      <h1 style={{ fontSize: "2.5rem" }}>Bem-vindo ao FinTrack</h1>
      <p>Gerencie suas finanças de forma simples e rápida!</p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={goToLogin}
          style={{
            padding: "0.75rem 1.5rem",
            cursor: "pointer",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#0070f3",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          Login
        </button>
        <button
          onClick={goToDashboard}
          style={{
            padding: "0.75rem 1.5rem",
            cursor: "pointer",
            borderRadius: "5px",
            border: "1px solid #0070f3",
            backgroundColor: "#fff",
            color: "#0070f3",
            fontWeight: "bold",
          }}
        >
          Dashboard
        </button>
      </div>
    </main>
  );
}
