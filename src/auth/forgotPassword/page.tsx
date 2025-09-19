"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebase";


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de redefinição enviado!");
    } catch (error: any) {
      alert("Erro: " + error.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center p-8 gap-4">
      <h1>Recuperar senha</h1>
      <form onSubmit={handleReset} className="flex flex-col gap-2 w-80">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Enviar email
        </button>
      </form>
    </main>
  );
}
