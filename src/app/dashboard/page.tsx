"use client";

import { useEffect, useState } from "react";
import { auth, signOut } from "../../firebase/config";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login");
    } else {
      setUserEmail(auth.currentUser.email);
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem", gap: "1.5rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "800px" }}>
        <h1>Dashboard FinTrack</h1>
        <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Logout
        </button>
      </header>

      <p>Bem-vindo, {userEmail}</p>

      <section style={{ display: "flex", gap: "1rem", flexWrap: "wrap", maxWidth: "800px", width: "100%" }}>
        <div style={{ flex: "1 1 200px", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2>Saldo</h2>
          <p>R$ 5.000,00</p>
        </div>
        <div style={{ flex: "1 1 200px", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2>Despesas</h2>
          <p>R$ 1.200,00</p>
        </div>
        <div style={{ flex: "1 1 200px", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2>Receitas</h2>
          <p>R$ 2.500,00</p>
        </div>
      </section>

      <section style={{ maxWidth: "800px", width: "100%" }}>
        <h2>Últimas transações</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Descrição</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "right" }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Compra no supermercado</td>
              <td style={{ textAlign: "right" }}>- R$ 200,00</td>
            </tr>
            <tr>
              <td>Salário</td>
              <td style={{ textAlign: "right" }}>+ R$ 2.500,00</td>
            </tr>
            <tr>
              <td>Assinatura Netflix</td>
              <td style={{ textAlign: "right" }}>- R$ 45,00</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
gi