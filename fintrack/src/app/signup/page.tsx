"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
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
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let digit = remainder >= 10 ? 0 : remainder;
    if (digit !== parseInt(cpf.charAt(9))) {
      return false;
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    digit = remainder >= 10 ? 0 : remainder;
    if (digit !== parseInt(cpf.charAt(10))) {
      return false;
    }

    return true;
  };

  const formatCPF = (cpf: string): string => {
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setCpf(formatCPF(value));
    }
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

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    if (name.length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await sendEmailVerification(user);
      
      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        cpf: cpf.replace(/\D/g, ''),
        emailVerified: false,
        createdAt: new Date(),
      });
      
      router.push("/verify-email");
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está em uso. Tente fazer login.");
      } else if (error.code === 'auth/invalid-email') {
        setError("E-mail inválido.");
      } else if (error.code === 'auth/weak-password') {
        setError("Senha muito fraca. Use pelo menos 6 caracteres.");
      } else {
        setError("Erro ao criar conta: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: "400px", 
      margin: "2rem auto", 
      padding: "2rem",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      backgroundColor: "white"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Criar Conta</h1>
      
      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Nome completo
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            required
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            E-mail
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Senha
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            CPF
          </label>
          <Input
            value={cpf}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            required
            maxLength={14}
          />
        </div>
        
        {error && (
          <div style={{ 
            padding: "0.75rem", 
            backgroundColor: "#fee", 
            border: "1px solid #fcc",
            borderRadius: "4px",
            color: "#c33"
          }}>
            {error}
          </div>
        )}
        
        <Button type="submit" disabled={isLoading} style={{ marginTop: "1rem" }}>
          {isLoading ? "Criando conta..." : "Criar Conta"}
        </Button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <p>Já tem uma conta? <a href="/login" style={{ color: "#0070f3", textDecoration: "none" }}>Faça login</a></p>
      </div>
    </div>
  );
}