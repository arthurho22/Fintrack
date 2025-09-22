
"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";
import { sendEmailVerification, onAuthStateChanged, signOut } from "firebase/auth";
import Button from "../../components/Button";
import Link from "next/link";

export default function VerifyEmail() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        if (user.emailVerified) {
          router.push("/dashboard");
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await sendEmailVerification(user);
      setMessage("✅ E-mail de verificação reenviado com sucesso!");
      setCountdown(60); 
    } catch (error: any) {
      setMessage("❌ Erro ao reenviar e-mail: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
      await auth.currentUser?.reload();
      const updatedUser = auth.currentUser;
      
      if (updatedUser?.emailVerified) {
        setMessage("🎉 E-mail verificado com sucesso! Redirecionando...");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setMessage("📭 E-mail ainda não verificado. Verifique sua caixa de entrada e spam.");
      }
    } catch (error: any) {
      setMessage("❌ Erro ao verificar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error: any) {
      setMessage("❌ Erro ao sair: " + error.message);
    }
  };

  if (!user) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: "500px", 
      margin: "2rem auto", 
      padding: "2rem",
      textAlign: "center",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      backgroundColor: "white"
    }}>
      <h1 style={{ color: "#0070f3", marginBottom: "1rem" }}>Verifique seu E-mail</h1>
      
      <div style={{ margin: "2rem 0" }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          Enviamos um link de verificação para:
        </p>
        <p style={{ 
          fontWeight: "bold", 
          fontSize: "1.2rem", 
          color: "#0070f3",
          marginBottom: "2rem"
        }}>
          {user.email}
        </p>
        
        <div style={{ 
          backgroundColor: "#f0f8ff", 
          padding: "1rem", 
          borderRadius: "8px",
          marginBottom: "2rem",
          textAlign: "left"
        }}>
          <h3 style={{ color: "#0070f3", marginBottom: "0.5rem" }}>📧 O que fazer agora:</h3>
          <ol style={{ paddingLeft: "1.5rem" }}>
            <li>Abra seu e-mail</li>
            <li>Procure por uma mensagem do FinTrack</li>
            <li>Clique no link de verificação</li>
            <li>Volte aqui e clique em "Já verifiquei"</li>
          </ol>
          <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
            💡 <strong>Dica:</strong> Verifique também a pasta de spam!
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Button 
          onClick={handleCheckVerification} 
          disabled={isLoading}
          style={{ width: "100%" }}
        >
          {isLoading ? "Verificando..." : "✅ Já verifiquei meu e-mail"}
        </Button>
        
        <Button 
          onClick={handleResendVerification} 
          disabled={isLoading || countdown > 0}
          variant="secondary"
          style={{ width: "100%" }}
        >
          {isLoading ? "Enviando..." : 
           countdown > 0 ? `Reenviar em ${countdown}s` : 
           "🔄 Reenviar e-mail de verificação"}
        </Button>

        <Button 
          onClick={handleLogout}
          variant="secondary"
          style={{ width: "100%" }}
        >
          🚪 Sair e voltar ao login
        </Button>
      </div>

      {message && (
        <div style={{ 
          marginTop: "1.5rem",
          padding: "1rem",
          borderRadius: "4px",
          backgroundColor: message.includes("❌") ? "#fee" : 
                          message.includes("✅") ? "#efe" : "#ffd",
          border: message.includes("❌") ? "1px solid #fcc" : 
                  message.includes("✅") ? "1px solid #cfc" : "1px solid #fd0",
          color: message.includes("❌") ? "#c33" : 
                 message.includes("✅") ? "#363" : "#960"
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#666" }}>
        <p>Problemas com a verificação? <Link href="/contact" style={{ color: "#0070f3" }}>Entre em contato</Link></p>
      </div>
    </div>
  );
}