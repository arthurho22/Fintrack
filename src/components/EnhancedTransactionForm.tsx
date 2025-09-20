"use client";

import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase/config";
import Button from "./Button";
import Input from "./Input";

interface EnhancedTransactionFormProps {
  onSubmitSuccess?: () => void;
}

const categories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Salário",
  "Freelance",
  "Outros"
];

export default function EnhancedTransactionForm({ onSubmitSuccess }: EnhancedTransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        userId: auth.currentUser.uid,
        description,
        amount: Number(amount),
        type,
        category: category || "Outros",
        date: new Date(date),
        createdAt: serverTimestamp(),
      });
      
      setDescription("");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split('T')[0]);
      
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      console.error("Erro ao adicionar transação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label>
          <input
            type="radio"
            value="expense"
            checked={type === "expense"}
            onChange={() => setType("expense")}
          />
          Despesa
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            value="income"
            checked={type === "income"}
            onChange={() => setType("income")}
          />
          Receita
        </label>
      </div>

      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição"
        required
      />

      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Valor"
        min="0"
        step="0.01"
        required
      />

      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        style={{ padding: "0.5rem", borderRadius: "4px" }}
      >
        <option value="">Selecione uma categoria</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adicionando..." : "Adicionar Transação"}
      </Button>
    </form>
  );
}