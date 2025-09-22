"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login");
    } else {
      setUserEmail(auth.currentUser.email);
      fetchTransactions(auth.currentUser.uid);
    }
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
    await signOut(auth);
    router.push("/login");
  };

  const handleTransactionAdded = () => {
    setShowForm(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem", gap: "1.5rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "800px" }}>
          <h1>Dashboard FinTrack</h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span>Olá, {userEmail}</span>
            <Button onClick={handleLogout} variant="secondary">
              Logout
            </Button>
          </div>
        </header>

        <section style={{ display: "flex", gap: "1rem", flexWrap: "wrap", maxWidth: "800px", width: "100%" }}>
          <div style={{ flex: "1 1 200px", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h2>Saldo</h2>
            <p style={{ color: balance >= 0 ? "green" : "red", fontSize: "1.5rem", fontWeight: "bold" }}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
          <div style={{ flex: "1 1 200px", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h2>Despesas</h2>
            <p style={{ color: "red", fontSize: "1.5rem", fontWeight: "bold" }}>
              R$ {totalExpenses.toFixed(2)}
            </p>
          </div>
          <div style={{ flex: "1 1 200px", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h2>Receitas</h2>
            <p style={{ color: "green", fontSize: "1.5rem", fontWeight: "bold" }}>
              R$ {totalIncome.toFixed(2)}
            </p>
          </div>
        </section>

        <section style={{ maxWidth: "800px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>Últimas transações</h2>
            <Button onClick={() => setShowForm(!showForm)} variant="primary">
              {showForm ? "Cancelar" : "Nova Transação"}
            </Button>
          </div>

          {showForm && (
            <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
              <Formularios onSubmitSuccess={handleTransactionAdded} />
            </div>
          )}

          {transactions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
            <p>Nenhuma transação encontrada.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}