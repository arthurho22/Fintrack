
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
      // Toast simplificado
      alert("Login realizado com sucesso!");
      router.push("/dashboard");
    } catch (error: any) {
      const message = 
        error.code === 'auth/invalid-credential' ? 'E-mail ou senha incorretos' :
        error.code === 'auth/user-not-found' ? 'Usuário não encontrado' :
        error.code === 'auth/wrong-password' ? 'Senha incorreta' :
        'Erro ao fazer login';
      
      setError(message);
      alert(message);
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
      alert("E-mail de recuperação enviado!");
    } catch (error: any) {
      const message = error.code === 'auth/user-not-found' ? 
        'E-mail não encontrado' : 'Erro ao enviar e-mail';
      setError(message);
      alert(message);
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
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Login</h1>
      
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
      
      {/* BOTÕES SIMPLES DE LOGIN SOCIAL (SEM COMPONENTE) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }}></div>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>Em breve</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }}></div>
        </div>
        
        <Button variant="secondary" disabled style={{ opacity: 0.6 }}>
          🔵 Login com Google (em breve)
        </Button>
        
        <Button variant="secondary" disabled style={{ opacity: 0.6 }}>
          ⚫ Login com GitHub (em breve)
        </Button>
      </div>
      
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button 
          onClick={handleResetPassword} 
          style={{ 
            background: "none", 
            border: "none", 
            color: "blue", 
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          Esqueci minha senha
        </button>
        
        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          Não tem uma conta? <a href="/signup" style={{ color: "blue" }}>Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}