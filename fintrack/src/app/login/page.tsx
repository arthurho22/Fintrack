"use client";

import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider 
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      const message = 
        error.code === 'auth/invalid-credential' ? 'E-mail ou senha incorretos' :
        error.code === 'auth/user-not-found' ? 'Usuário não encontrado' :
        'Erro ao fazer login';
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      setError('Erro ao fazer login com Google');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoadingGithub(true);
    setError("");

    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      setError('Erro ao fazer login com GitHub');
    } finally {
      setIsLoadingGithub(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Digite seu e-mail para redefinir a senha");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      setError('Erro ao enviar e-mail de recuperação');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.logo}>💰</div>
          <h1 style={styles.title}>FinTrack</h1>
          <p style={styles.subtitle}>Entre na sua conta</p>
        </div>

        {/* Formulário de Login Tradicional - AGORA EM CIMA */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
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
            <div style={styles.errorBox}>⚠️ {error}</div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              opacity: isLoading ? 0.7 : 1
            }}
            disabled={isLoading}
          >
            {isLoading ? "⏳ Entrando..." : "🔓 Entrar com E-mail"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>ou entre com</span>
        </div>

        {/* Botões de Login Social - AGORA EMBAIXO */}
        <div style={styles.socialButtons}>
          <button 
            onClick={handleGoogleLogin}
            style={{
              ...styles.socialButton,
              ...styles.googleButton,
              opacity: isLoadingGoogle ? 0.7 : 1
            }}
            disabled={isLoadingGoogle}
          >
            <span style={styles.socialIcon}>🔵</span>
            {isLoadingGoogle ? "Conectando..." : "Google"}
          </button>

          <button 
            onClick={handleGithubLogin}
            style={{
              ...styles.socialButton,
              ...styles.githubButton,
              opacity: isLoadingGithub ? 0.7 : 1
            }}
            disabled={isLoadingGithub}
          >
            <span style={styles.socialIcon}>⚫</span>
            {isLoadingGoogle ? "Conectando..." : "GitHub"}
          </button>
        </div>

        <div style={styles.footer}>
          <button onClick={handleResetPassword} style={styles.resetButton}>
            Esqueci minha senha
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
    backgroundColor: "00D2A0",
  },
  
  background: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #00D2A0 0%, #00B894 100%)',
    zIndex: -1,
  },
  
  loginCard: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '420px',
  },
  
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  
  logo: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
  },
  
  title: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 0.5rem 0',
  },
  
  subtitle: {
    color: '#718096',
    fontSize: '1.1rem',
    margin: 0,
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.2rem',
    marginBottom: '1.5rem',
  },
  
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  
  input: {
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
  },
  
  inputFocus: {
    borderColor: '#00D2A0',
  },
  
  errorBox: {
    background: '#fed7d7',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
  },
  
  submitButton: {
    background: 'linear-gradient(135deg, #00D2A0, #00B894)',
    color: 'white',
    border: 'none',
    padding: '1.2rem 2rem',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
    marginTop: '0.5rem',
  },
  
  divider: {
    position: 'relative' as const,
    textAlign: 'center' as const,
    margin: '2rem 0',
  },
  
  dividerText: {
    background: 'white',
    padding: '0 1rem',
    color: '#718096',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  
  socialButtons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.8rem',
    marginBottom: '1.5rem',
  },
  
  socialButton: {
    padding: '1rem 1.5rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    transition: 'all 0.3s',
  },
  
  socialIcon: {
    fontSize: '1.2rem',
  },
  
  googleButton: {
    background: 'white',
    color: '#4285F4',
    borderColor: '#4285F4',
  },
  
  githubButton: {
    background: 'white',
    color: '#333',
    borderColor: '#333',
  },
  
  footer: {
    marginTop: '2rem',
    textAlign: 'center' as const,
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1.5rem',
  },
  
  resetButton: {
    background: 'none',
    border: 'none',
    color: '#00B894',
    cursor: 'pointer',
    fontSize: '1rem',
    textDecoration: 'underline',
    fontWeight: '500',
  },
};