"use client";

import { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase/firebase";

interface FormularioProps {
  onSubmitSuccess?: () => void;
}

export default function Formularios({ onSubmitSuccess }: FormularioProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [type, setType] = useState<"income" | "expense">("income");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, "transactions"), {
        userId: auth.currentUser.uid,
        description,
        amount: Number(amount),
        type,
        date: serverTimestamp(),
      });
      setDescription("");
      setAmount("");
      setType("income");
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      alert("Erro ao adicionar transação: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
      <input
        type="text"
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        style={{ padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
      />
      <input
        type="number"
        placeholder="Valor"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        required
        style={{ padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
      />
      <select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")} style={{ padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}>
        <option value="income">Receita</option>
        <option value="expense">Despesa</option>
      </select>
      <button type="submit" style={{ padding: "0.5rem", borderRadius: "5px", backgroundColor: "#0070f3", color: "#fff", cursor: "pointer" }}>
        Adicionar
      </button>
    </form>
  );
}
