"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    category: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      await loadTransactions(user.uid);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  
  const loadTransactions = async (userId: string) => {
  try {
    console.log("📥 Carregando transações para usuário:", userId);
    
    const q = query(
      collection(db, "transactions"), 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log("📊 Transações encontradas:", querySnapshot.size);
    
    const transactionsData: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactionsData.push({ 
        id: doc.id, 
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date
      });
    });
    
    transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    console.log("✅ Transações carregadas:", transactionsData);
    setTransactions(transactionsData);
    
  } catch (error) {
    console.error("❌ Erro ao carregar transações:", error);
  }
};
  
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🎯 INICIANDO SALVAMENTO...");
    
    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    if (!newTransaction.description.trim()) {
      alert("Digite uma descrição");
      return;
    }

    const amountValue = parseFloat(newTransaction.amount);
    if (!newTransaction.amount || isNaN(amountValue) || amountValue <= 0) {
      alert("Digite um valor válido maior que zero");
      return;
    }

    if (!newTransaction.category.trim()) {
      alert("Digite uma categoria");
      return;
    }

    setIsSaving(true);
    console.log("🔄 Estado isSaving: TRUE");

    try {
      console.log("📦 Preparando dados...");
      
      const transactionData = {
        description: newTransaction.description.trim(),
        amount: amountValue,
        type: newTransaction.type,
        category: newTransaction.category.trim(),
        date: new Date().toISOString(),
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      console.log("🔥 Tentando salvar no Firestore...", transactionData);

      const docRef = await addDoc(collection(db, "transactions"), transactionData);
      
      console.log("✅ SUCESSO! Documento criado com ID:", docRef.id);

      setNewTransaction({
        description: '',
        amount: '',
        type: 'income',
        category: ''
      });

      console.log("📋 Fechando modal...");
      setShowAddTransaction(false);

      console.log("🔄 Recarregando transações...");
      await loadTransactions(user.uid);

      console.log("🎉 Processo completo!");

    } catch (error: any) {
      console.error("❌ ERRO CRÍTICO:", error);
      console.error("Detalhes do erro:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      alert(`Erro ao salvar: ${error.message || "Verifique o console"}`);
    } finally {
      console.log("🏁 Finalizando - isSaving: FALSE");
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

    try {
      await deleteDoc(doc(db, "transactions", id));
      await loadTransactions(user.uid);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Erro ao excluir transação");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair:', error);
      alert('Erro ao fazer logout');
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando seu dashboard...</p>
      </div>
    );
  }

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerInfo}>
          <h1 style={styles.title}>💰 FinTrack</h1>
          <p style={styles.subtitle}>Olá, {user?.email?.split('@')[0]}! 👋</p>
        </div>
        
        <div style={styles.headerActions}>
          <button 
            onClick={() => setShowAddTransaction(true)}
            style={styles.primaryButton}
          >
            ➕ Nova Transação
          </button>
          <button 
            onClick={handleSignOut}
            style={styles.logoutButton}
          >
            🚪 Sair
          </button>
        </div>
      </header>

      <section style={styles.summarySection}>
        <div style={styles.summaryGrid}>
          <div style={{...styles.summaryCard, ...styles.incomeCard}}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>📥</span>
              <span style={styles.cardLabel}>Receitas</span>
            </div>
            <p style={styles.cardAmount}>R$ {totalIncome.toFixed(2)}</p>
          </div>

          <div style={{...styles.summaryCard, ...styles.expenseCard}}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>📤</span>
              <span style={styles.cardLabel}>Despesas</span>
            </div>
            <p style={styles.cardAmount}>R$ {totalExpenses.toFixed(2)}</p>
          </div>

          <div style={{...styles.summaryCard, ...styles.balanceCard}}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>💎</span>
              <span style={styles.cardLabel}>Saldo</span>
            </div>
            <p style={{
              ...styles.cardAmount,
              color: balance >= 0 ? '#10b981' : '#ef4444'
            }}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      <section style={styles.contentGrid}>
        <div style={styles.transactionsCard}>
          <div style={styles.cardTitle}>
            <h2>📋 Últimas Transações</h2>
            <span style={styles.transactionCount}>{transactions.length} transações</span>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💸</div>
              <p style={styles.emptyText}>Nenhuma transação cadastrada</p>
              <button 
                onClick={() => setShowAddTransaction(true)}
                style={styles.emptyButton}
              >
                ➕ Adicionar Transação
              </button>
            </div>
          ) : (
            <div style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} style={styles.transactionItem}>
                  <div style={styles.transactionIcon}>
                    {transaction.type === 'income' ? '📥' : '📤'}
                  </div>
                  
                  <div style={styles.transactionDetails}>
                    <span style={styles.transactionDescription}>
                      {transaction.description}
                    </span>
                    <span style={styles.transactionCategory}>
                      {transaction.category}
                    </span>
                    <span style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div style={styles.transactionAmount}>
                    <span style={{
                      ...styles.amountText,
                      color: transaction.type === 'income' ? '#10b981' : '#ef4444'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      style={styles.deleteButton}
                      title="Excluir transação"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.statsCard}>
          <h2 style={styles.statsTitle}>📊 Resumo</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>{transactions.length}</span>
              <span style={styles.statLabel}>Total</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>
                {transactions.filter(t => t.type === 'income').length}
              </span>
              <span style={styles.statLabel}>Receitas</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>
                {transactions.filter(t => t.type === 'expense').length}
              </span>
              <span style={styles.statLabel}>Despesas</span>
            </div>
          </div>
          
          <div style={styles.quickActions}>
            <h3 style={styles.actionsTitle}>Ações Rápidas</h3>
            <button 
              onClick={() => {
                setNewTransaction({
                  description: '',
                  amount: '',
                  type: 'income',
                  category: ''
                });
                setShowAddTransaction(true);
              }}
              style={styles.quickButton}
            >
              💰 Adicionar Receita
            </button>
            <button 
              onClick={() => {
                setNewTransaction({
                  description: '',
                  amount: '',
                  type: 'expense',
                  category: ''
                });
                setShowAddTransaction(true);
              }}
              style={{...styles.quickButton, ...styles.expenseQuickButton}}
            >
              💳 Adicionar Despesa
            </button>
          </div>
        </div>
      </section>

      {showAddTransaction && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>➕ Nova Transação</h3>
              <button 
                onClick={() => setShowAddTransaction(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição *</label>
                <input
                  type="text"
                  placeholder="Ex: Salário, Aluguel, Supermercado..."
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({
                    ...newTransaction,
                    description: e.target.value
                  })}
                  style={styles.modalInput}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Valor (R$) *</label>
                <input
                  type="number"
                  placeholder="0,00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value
                  })}
                  style={styles.modalInput}
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo *</label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({
                    ...newTransaction,
                    type: e.target.value as 'income' | 'expense'
                  })}
                  style={styles.modalInput}
                  required
                >
                  <option value="income">📥 Receita</option>
                  <option value="expense">📤 Despesa</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Categoria *</label>
                <input
                  type="text"
                  placeholder="Ex: Salário, Alimentação, Transporte..."
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({
                    ...newTransaction,
                    category: e.target.value
                  })}
                  style={styles.modalInput}
                  required
                />
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  style={styles.cancelButton}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{
                    ...styles.saveButton,
                    backgroundColor: newTransaction.type === 'income' ? '#10b981' : '#ef4444',
                    opacity: isSaving ? 0.7 : 1
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? '⏳ Salvando...' : '💾 Salvar Transação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#f8fafc',
  },
  
  // NOVO: Container do botão de teste
  testContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    background: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
  },
  
  testButton: {
    padding: '0.75rem 1.5rem',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  
  testText: {
    color: '#92400e',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    gap: '1rem',
  },
  
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #00D2A0',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  loadingText: {
    color: '#64748b',
    fontSize: '1.1rem',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  
  headerInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  
  title: {
    margin: 0,
    color: '#1a202c',
    fontSize: '1.8rem',
    fontWeight: '700',
  },
  
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '1rem',
  },
  
  headerActions: {
    display: 'flex',
    gap: '1rem',
  },
  
  primaryButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #00D2A0, #00B894)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  
  logoutButton: {
    padding: '0.75rem 1.5rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  
  summarySection: {
    marginBottom: '2rem',
  },
  
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  
  summaryCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  
  incomeCard: {
    borderLeft: '4px solid #10b981',
  },
  
  expenseCard: {
    borderLeft: '4px solid #ef4444',
  },
  
  balanceCard: {
    borderLeft: '4px solid #6366f1',
  },
  
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  
  cardIcon: {
    fontSize: '1.5rem',
  },
  
  cardLabel: {
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  
  cardAmount: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1a202c',
  },
  
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
  },
  
  transactionsCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  
  statsCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    height: 'fit-content',
  },
  
  cardTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  
  transactionCount: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem 2rem',
    color: '#64748b',
  },
  
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  
  emptyText: {
    margin: '0 0 1.5rem 0',
    fontSize: '1rem',
  },
  
  emptyButton: {
    padding: '0.75rem 1.5rem',
    background: '#00D2A0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  
  transactionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  
  transactionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  
  transactionIcon: {
    fontSize: '1.2rem',
  },
  
  transactionDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  
  transactionDescription: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  
  transactionCategory: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
  
  transactionDate: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  
  transactionAmount: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  
  amountText: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.5rem',
    borderRadius: '4px',
  },
  
  statsTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.2rem',
    color: '#1a202c',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  
  statItem: {
    textAlign: 'center' as const,
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  
  statValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#00D2A0',
  },
  
  statLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  
  quickActions: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1.5rem',
  },
  
  actionsTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    color: '#1a202c',
  },
  
  quickButton: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    background: '#00D2A0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  
  expenseQuickButton: {
    background: '#ef4444',
  },
  
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  
  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#64748b',
  },
  
  modalForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  
  label: {
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.9rem',
  },
  
  modalInput: {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  
  modalActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    background: '#e2e8f0',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  
  saveButton: {
    flex: 2,
    padding: '0.75rem',
    background: '#00D2A0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}