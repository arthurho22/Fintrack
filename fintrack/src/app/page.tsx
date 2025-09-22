"use client";

import { useState } from "react";

export default function Home() {
  const [saldo, setSaldo] = useState(1250.75);
  const [gastos, setGastos] = useState([
    { id: 1, descricao: "Supermercado", valor: 320.5 },
    { id: 2, descricao: "Transporte", valor: 80.0 },
    { id: 3, descricao: "Lazer", valor: 150.0 },
  ]);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>FinTrack - Dashboard</h1>
      <h2>💰 Saldo atual: R$ {saldo.toFixed(2)}</h2>

      <h3>📊 Últimos Gastos</h3>
      <ul>
        {gastos.map((g) => (
          <li key={g.id}>
            {g.descricao} - R$ {g.valor.toFixed(2)}
          </li>
        ))}
      </ul>
    </main>
  );
}
