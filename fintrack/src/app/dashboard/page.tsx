"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getTransactions } from "../../firebase/transactions";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: Date;
}

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login";
      } else {
        setUserEmail(user.email);

        try {
          const userTransactions = await getTransactions();
          setTransactions(userTransactions);
        } catch (error) {
          console.error("Erro ao carregar transações:", error);
        }

        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.toISOString().substring(0, 7);
    if (!acc[month]) acc[month] = { income: 0, expenses: 0 };

    if (t.type === "income") acc[month].income += t.amount;
    else acc[month].expenses += t.amount;

    return acc;
  }, {} as Record<string, { income: number; expenses: number }>);

  const sortedMonths = Object.keys(monthlyData).sort();

  const barChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        label: "Gastos por Categoria (R$)",
        data: Object.values(expensesByCategory),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: sortedMonths.map((month) => {
      const [year, monthNum] = month.split("-");
      return `${monthNum}/${year}`;
    }),
    datasets: [
      {
        label: "Receitas",
        data: sortedMonths.map((month) => monthlyData[month].income),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.1,
        fill: true,
      },
      {
        label: "Despesas",
        data: sortedMonths.map((month) => monthlyData[month].expenses),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ["Receitas", "Despesas"],
    datasets: [
      {
        data: [totalIncome, totalExpenses],
        backgroundColor: ["#10B981", "#EF4444"],
        hoverBackgroundColor: ["#0DA271", "#DC2626"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `R$ ${context.raw.toFixed(2)}`;
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid #f3f3f3",
            borderTop: "5px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
          Carregando seus dados...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "1400px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1.5rem",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: "#1f2937" }}>📊 Dashboard Financeiro</h1>
          <p style={{ margin: "0.5rem 0 0 0", color: "#6b7280" }}>
            Bem-vindo, {userEmail}
          </p>
          <small style={{ color: "#9ca3af" }}>
            {transactions.length} transações encontradas
          </small>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => (window.location.href = "/transactions")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            💳 Transações
          </button>
          <button
            onClick={() => (window.location.href = "/profile")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            👤 Perfil
          </button>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", opacity: 0.9 }}>
            Receitas Totais
          </h3>
          <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>
            R$ {totalIncome.toFixed(2)}
          </p>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", opacity: 0.9 }}>
            Despesas Totais
          </h3>
          <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>
            R$ {totalExpenses.toFixed(2)}
          </p>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", opacity: 0.9 }}>
            Saldo Atual
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: "bold",
              color: balance >= 0 ? "#10B981" : "#EF4444",
            }}
          >
            R$ {balance.toFixed(2)}
          </p>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            height: "400px",
          }}
        >
          <h3 style={{ margin: "0 0 1rem 0" }}>Gastos por Categoria</h3>
          <Bar data={barChartData} options={chartOptions} />
        </div>

        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            height: "400px",
          }}
        >
          <h3 style={{ margin: "0 0 1rem 0" }}>Receitas vs Despesas</h3>
          <Doughnut data={doughnutData} options={chartOptions} />
        </div>

        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            gridColumn: "1 / -1",
            height: "400px",
          }}
        >
          <h3 style={{ margin: "0 0 1rem 0" }}>Evolução Mensal</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </section>

      <section
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ margin: "0 0 1rem 0" }}>Últimas Transações</h3>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                background: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <div>
                <strong>{transaction.category}</strong>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {transaction.date.toLocaleDateString("pt-BR")}
                </div>
              </div>
              <span
                style={{
                  color: transaction.type === "income" ? "#10B981" : "#EF4444",
                  fontWeight: "bold",
                }}
              >
                {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}