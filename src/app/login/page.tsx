"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Digite seu e-mail para redefinir a senha");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "2rem" }}>
      <h1>Login</h1>
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
        
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        {resetEmailSent && (
          <p style={{ color: "green" }}>
            E-mail de redefinição enviado! Verifique sua caixa de entrada.
          </p>
        )}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Carregando..." : "Entrar"}
        </Button>
      </form>
      
      <div style={{ marginTop: "1rem" }}>
        <button 
          onClick={handleResetPassword} 
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
}