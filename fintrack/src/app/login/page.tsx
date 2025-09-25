"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";

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
      alert("Login realizado com sucesso!");
      router.push("/dashboard");
    } catch (error: any) {
      const message = 
        error.code === 'auth/invalid-credential' ? 'E-mail ou senha incorretos' :
        error.code === 'auth/user-not-found' ? 'Usuário não encontrado' :
        error.code === 'auth/wrong-password' ? 'Senha incorreta' :
        'Erro ao fazer login';
      
      setError(message);
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
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Verde */}
      <div style={styles.background}></div>
      
      {/* Card de Login */}
      <div style={styles.loginCard}>
        {/* Header com Logo */}
        <div style={styles.header}>
          <div style={styles.logo}>
            💰
          </div>
          <h1 style={styles.title}>FinTrack</h1>
          <p style={styles.subtitle}>Controle suas finanças de forma inteligente</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              style={styles.input}
              required
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {resetEmailSent && (
            <div style={styles.successBox}>
              ✅ E-mail de redefinição enviado! Verifique sua caixa de entrada.
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              opacity: isLoading ? 0.7 : 1
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div style={styles.spinner}></div>
                Entrando...
              </>
            ) : (
              "🔓 Entrar na Minha Conta"
            )}
          </button>
        </form>

        {/* Links de Ação */}
        <div style={styles.actionLinks}>
          <button 
            onClick={handleResetPassword} 
            style={styles.resetButton}
          >
            🔑 Esqueci minha senha
          </button>
          
          <div style={styles.signupLink}>
            <span style={styles.signupText}>Não tem uma conta?</span>
            <a href="/signup" style={styles.signupButton}>
              📝 Cadastre-se gratuitamente
            </a>
          </div>
        </div>

        {/* Divisor */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>ou entre com</span>
        </div>

        {/* Botões Sociais */}
        <div style={styles.socialButtons}>
          <button style={styles.googleButton}>
            <span style={styles.googleIcon}>🔵</span>
            Continuar com Google
          </button>
          
          <button style={styles.githubButton}>
            <span style={styles.githubIcon}>⚫</span>
            Continuar com GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    fontFamily: "'Inter', sans-serif",
    padding: '1rem',
  },
  
  background: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #00D2A0 0%, #00B894 50%, #00A885 100%)',
    zIndex: -1,
  },
  
  loginCard: {
    background: 'white',
    padding: '3rem',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  
  header: {
    textAlign: 'center' as const,
    marginBottom: '2.5rem',
  },
  
  logo: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #00D2A0, #00B894)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    },
  
  subtitle: {
    color: '#718096',
    fontSize: '1.1rem',
    margin: 0,
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  
  label: {
    fontWeight: '600',
    color: '#2d3748',
    fontSize: '0.9rem',
  },
  
  input: {
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },
  
  inputFocus: {
    borderColor: '#00D2A0',
    boxShadow: '0 0 0 3px rgba(0, 210, 160, 0.1)',
  },
  
  errorBox: {
    background: '#fed7d7',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
  },
  
  successBox: {
    background: '#c6f6d5',
    color: '#2f855a',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
  },
  
  submitButton: {
    background: 'linear-gradient(135deg, #00D2A0, #00B894)',
    color: 'white',
    border: 'none',
    padding: '1.25rem 2rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  actionLinks: {
    marginTop: '2rem',
    textAlign: 'center' as const,
  },
  
  resetButton: {
    background: 'none',
    border: 'none',
    color: '#00B894',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'underline',
  },
  
  signupLink: {
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  
  signupText: {
    color: '#718096',
    fontSize: '0.9rem',
  },
  
  signupButton: {
    color: '#00B894',
    fontWeight: '600',
    textDecoration: 'none',
  },
  
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '2rem 0',
    color: '#a0aec0',
  },
  
  dividerText: {
    padding: '0 1rem',
    background: 'white',
    fontSize: '0.9rem',
  },
  
  socialButtons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  
  githubButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  
  googleIcon: {
    fontSize: '1.2rem',
  },
  
  githubIcon: {
    fontSize: '1.2rem',
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    input:focus {
      border-color: #00D2A0 !important;
      box-shadow: 0 0 0 3px rgba(0, 210, 160, 0.1) !important;
      outline: none;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
  `;
  document.head.appendChild(style);
}