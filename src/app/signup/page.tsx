"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateCPF = (cpf: string): boolean => {
    return cpf.replace(/\D/g, '').length === 11;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateCPF(cpf)) {
      setError("CPF inválido");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await sendEmailVerification(user);
      
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        cpf: cpf.replace(/\D/g, ''),
        createdAt: new Date(),
      });
      
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "2rem" }}>
      <h1>Criar Conta</h1>
      
      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          required
        />
        
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          required
        />
        
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
        />
        
        <Input
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="CPF"
          required
        />
        
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Criando conta..." : "Criar Conta"}
        </Button>
      </form>
    </div>
  );
}