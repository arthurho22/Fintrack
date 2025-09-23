
"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!auth.currentUser) {
        window.location.href = "/login";
      } else {
        setUserEmail(auth.currentUser.email);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <main style={{ 
      padding: "2rem", 
      maxWidth: "800px", 
      margin: "0 auto",
      fontFamily: "Arial, sans-serif"
    }}>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <h1 style={{ margin: 0 }}>👤 Perfil do Usuário</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            onClick={() => window.location.href = "/dashboard"}
            style={{ 
              padding: "0.5rem 1rem", 
              background: "#3b82f6", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: "0.5rem 1rem", 
              background: "#ef4444", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🚪 Sair
          </button>
        </div>
      </header>

      <section style={{ 
        background: "white", 
        padding: "2rem", 
        borderRadius: "8px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "2rem"
      }}>
        <h2 style={{ margin: "0 0 1.5rem 0" }}>Informações da Conta</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <strong>📧 E-mail:</strong> {userEmail}
          </div>
          <div>
            <strong>🆔 ID do Usuário:</strong> {auth.currentUser?.uid}
          </div>
          <div>
            <strong>✅ E-mail Verificado:</strong> 
            <span style={{ color: auth.currentUser?.emailVerified ? "green" : "red", marginLeft: "0.5rem" }}>
              {auth.currentUser?.emailVerified ? "Sim" : "Não"}
            </span>
          </div>
          <div>
            <strong>📅 Conta Criada:</strong>{" "}
            {auth.currentUser?.metadata.creationTime 
              ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString("pt-BR")
              : "Data não disponível"
            }
          </div>
        </div>
      </section>

      <div style={{ 
        background: "#f0f9ff", 
        padding: "1.5rem", 
        borderRadius: "8px", 
        border: "1px solid #bae6fd"
      }}>
        <h3 style={{ margin: "0 0 1rem 0" }}>💡 Dicas</h3>
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li>Mantenha seus dados atualizados</li>
          <li>Verifique seu e-mail para funcionalidades completas</li>
          <li>Entre em contato em caso de problemas</li>
        </ul>
      </div>
    </main>
  );
}