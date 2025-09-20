"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      router.push("/dashboard"); 
    } catch (error: any) {
      setErro("Erro ao criar conta, tente novamente.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-lg p-8 rounded-lg w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Cadastro</h1>

        {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Criar conta
        </button>

        <p className="mt-4 text-sm text-center">
          Já tem conta?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Entrar
          </a>
        </p>
      </form>
    </div>
  );
}
