"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #ccc",
        marginBottom: "2rem",
      }}
    >
      <h1
        style={{ cursor: "pointer" }}
        onClick={() => router.push("/dashboard")}
      >
        FinTrack
      </h1>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button onClick={() => router.push("/dashboard")}>Dashboard</button>
        <button onClick={() => router.push("/profile")}>Profile</button>
        <button onClick={() => router.push("/login")}>Logout</button>
      </div>
    </nav>
  );
}
