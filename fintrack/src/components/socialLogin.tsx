
"use client";

import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Button from "./Button";

export default function SocialLogin() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      

      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          provider: "google",
          createdAt: new Date(),
          emailVerified: user.emailVerified,
        });
      }
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erro no login Google:", error);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          provider: "github",
          createdAt: new Date(),
          emailVerified: user.emailVerified,
        });
      }
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erro no login GitHub:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }}></div>
        <span style={{ color: "#666", fontSize: "0.9rem" }}>Ou entre com</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }}></div>
      </div>
      
      <Button 
        onClick={handleGoogleLogin} 
        variant="secondary"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
      >
        <span>🔵</span> Continuar com Google
      </Button>
      
      <Button 
        onClick={handleGitHubLogin} 
        variant="secondary"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
      >
        <span>⚫</span> Continuar com GitHub
      </Button>
    </div>
  );
}