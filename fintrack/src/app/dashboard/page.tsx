
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { Auth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Button from "../../components/Button";
import Formularios from "../../components/formularios";
import TransactionCard from "../../components/TransationalCard";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: any;
  category?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!user.emailVerified) {
          router.push("/verify-email");
          return;
        }
        setUser(user);
        fetchTransactions(user.uid);
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchTransactions = (userId: string) => {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = [];
      let income = 0;
      let expenses = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          ...data
        } as Transaction);

        if (data.type === "income") {
          income += data.amount;
        } else {
          expenses += data.amount;
        }
      });

      setTransactions(transactionsData);
      setTotalIncome(income);
      setTotalExpenses(expenses);
      setBalance(income - expenses);
    });

    return unsubscribe;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleTransactionAdded = () => {
    setShowForm(false);
  };

  const handleVerifyEmail = () => {
    router.push("/verify-email");
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: "4px solid #f3f3f3", 
          borderTop: "4px solid #0070f3", 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite" 
        }}></div>
        <p>Carregando dashboard...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem", gap: "1.5rem" }}>
        <header style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          width: "100%", 
          maxWidth: "1000px",
          padding: "1rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div>
            <h1 style={{ margin: 0, color: "#0070f3" }}>Dashboard FinTrack</h1>
            <p style={{ margin: "0.5rem 0 0 0", color: "#666" }}>
              Olá, <strong>{user.displayName || user.email}</strong>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
              <span style={{ 
                padding: "0.25rem 0.5rem", 
                backgroundColor: user.emailVerified ? "#d4edda" : "#fff3cd", 
                color: user.emailVerified ? "#155724" : "#856404",
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontWeight: "bold"
              }}>
                {user.emailVerified ? "✅ E-mail verificado" : "⚠ E-mail não verificado"}
              </span>
              {!user.emailVerified && (
                <Button onClick={handleVerifyEmail} variant="secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
                  Verificar
                </Button>
              )}
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Button onClick={() => setShowForm(!showForm)} variant="primary">
              {showForm ? "❌ Cancelar" : "➕ Nova Transação"}
            </Button>
            <Button onClick={handleLogout} variant="secondary">
              🚪 Sair
            </Button>
          </div>
        </header>

        <section style={{ 
          display: "flex", 
          gap: "1rem", 
          flexWrap: "wrap", 
          maxWidth: "1000px", 
          width: "100%" 
        }}>
          <div style={{ 
            flex: "1 1 200px", 
            padding: "1.5rem", 
            border: "1px solid #e0e0e0", 
            borderRadius: "8px",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#666" }}>Saldo Total</h3>
            <p style={{ 
              color: balance >= 0 ? "#10b981" : "#ef4444", 
              fontSize: "2rem", 
              fontWeight: "bold",
              margin: 0
            }}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
          
          <div style={{ 
            flex: "1 1 200px", 
            padding: "1.5rem", 
            border: "1px solid #e0e0e0", 
            borderRadius: "8px",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#666" }}>Receitas</h3>
            <p style={{ 
              color: "#10b981", 
              fontSize: "2rem", 
              fontWeight: "bold",
              margin: 0
            }}>
              R$ {totalIncome.toFixed(2)}
            </p>
          </div>
          
          <div style={{ 
            flex: "1 1 200px", 
            padding: "1.5rem", 
            border: "1px solid #e0e0e0", 
            borderRadius: "8px",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#666" }}>Despesas</h3>
            <p style={{ 
              color: "#ef4444", 
              fontSize: "2rem", 
              fontWeight: "bold",
              margin: 0
            }}>
              R$ {totalExpenses.toFixed(2)}
            </p>
          </div>
        </section>

        {showForm && (
          <section style={{ 
            maxWidth: "1000px", 
            width: "100%",
            padding: "1.5rem",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 1rem 0" }}>Adicionar Nova Transação</h3>
            <Formularios onSubmitSuccess={handleTransactionAdded} />
          </section>
        )}

        <section style={{ 
          maxWidth: "1000px", 
          width: "100%",
          padding: "1.5rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "1.5rem" 
          }}>
            <h3 style={{ margin: 0 }}>Últimas Transações</h3>
            <span style={{ color: "#666", fontSize: "0.9rem" }}>
              {transactions.length} transação{transactions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {transactions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  description={transaction.description}
                  amount={transaction.amount}
                  type={transaction.type}
                />
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              padding: "3rem", 
              color: "#666",
              border: "2px dashed #e0e0e0",
              borderRadius: "8px"
            }}>
              <p style={{ fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>📊 Nenhuma transação encontrada</p>
              <p>Comece adicionando sua primeira transação!</p>
              <Button onClick={() => setShowForm(true)} variant="primary" style={{ marginTop: "1rem" }}>
                ➕ Adicionar Primeira Transação
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function onAuthStateChanged(auth: Auth, arg1: (user: any) => void) {
  throw new Error("Function not implemented.");
}
