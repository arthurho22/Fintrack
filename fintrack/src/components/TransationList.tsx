"use client";

import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getTransactions, addTransaction } from '../firebase/transactions';

interface TransactionForm {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export default function TransactionsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [form, setForm] = useState<TransactionForm>({
    type: 'expense',
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = {
    income: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros'],
    expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/login';
      } else {
        setUserEmail(user.email);
        await loadTransactions();
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadTransactions = async () => {
    try {
      const userTransactions = await getTransactions();
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      await addTransaction({
        ...form,
        date: new Date(form.date),
        amount: Number(form.amount)
      });

      // Limpar formulário
      setForm({
        type: 'expense',
        category: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
      });

      // Recarregar lista
      await loadTransactions();
      alert('Transação adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      alert('Erro ao adicionar transação.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleInputChange = (field: keyof TransactionForm, value: string | number) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Carregando transações...</p>
      </div>
    );
  }

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>💳 Gerenciar Transações</h1>
          <p style={styles.subtitle}>Bem-vindo, {userEmail}</p>
        </div>
        <div style={styles.headerButtons}>
          <button 
            style={styles.primaryButton}
            onClick={() => window.location.href = '/dashboard'}
          >
            📊 Voltar ao Dashboard
          </button>
        </div>
      </header>

      <div style={styles.content}>
        <section style={styles.formSection}>
          <h2 style={styles.sectionTitle}>➕ Adicionar Nova Transação</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Tipo *</label>
                <select 
                  value={form.type}
                  onChange={(e) => handleInputChange('type', e.target.value as 'income' | 'expense')}
                  style={styles.select}
                  required
                >
                  <option value="expense">📤 Despesa</option>
                  <option value="income">📥 Receita</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Categoria *</label>
                <select 
                  value={form.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Selecione...</option>
                  {(form.type === 'income' ? categories.income : categories.expense).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Data *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Descrição</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Ex: Supermercado mensal, Pagamento cliente..."
                style={styles.input}
              />
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                opacity: isAdding ? 0.7 : 1
              }}
              disabled={isAdding}
            >
              {isAdding ? 'Adicionando...' : '💾 Salvar Transação'}
            </button>
          </form>
        </section>

        <section style={styles.listSection}>
          <h2 style={styles.sectionTitle}>📋 Últimas Transações</h2>
          
          {transactions.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Nenhuma transação cadastrada ainda.</p>
              <p>Adicione sua primeira transação acima! 📝</p>
            </div>
          ) : (
            <div style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <div key={transaction.id} style={{
                  ...styles.transactionItem,
                  borderLeft: `4px solid ${transaction.type === 'income' ? '#10B981' : '#EF4444'}`
                }}>
                  <div style={styles.transactionInfo}>
                    <div style={styles.transactionHeader}>
                      <strong style={styles.transactionCategory}>
                        {transaction.category}
                      </strong>
                      <span style={{
                        ...styles.transactionAmount,
                        color: transaction.type === 'income' ? '#10B981' : '#EF4444'
                      }}>
                        {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                      </span>
                    </div>
                    <p style={styles.transactionDescription}>{transaction.description}</p>
                    <small style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column' as const,
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
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    padding: '2rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  
  title: {
    margin: '0 0 0.5rem 0',
    color: '#1a202c',
    fontSize: '2rem',
    fontWeight: '700',
  },
  
  subtitle: {
    margin: '0',
    color: '#718096',
    fontSize: '1.1rem',
  },
  
  headerButtons: {
    display: 'flex',
    gap: '1rem',
  },
  
  primaryButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #00D2A0, #00B894)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  
  content: {
    display: 'grid',
    gap: '2rem',
  },
  
  formSection: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  
  listSection: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  
  sectionTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#2d3748',
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  
  label: {
    fontWeight: '600',
    color: '#4a5568',
    fontSize: '0.9rem',
  },
  
  input: {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  
  select: {
    padding: '0.75rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    background: 'white',
  },
  
  submitButton: {
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
  },
  
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#a0aec0',
  },
  
  transactionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  
  transactionItem: {
    padding: '1.5rem',
    background: '#f7fafc',
    borderRadius: '12px',
  },
  
  transactionInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  
  transactionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  transactionCategory: {
    fontSize: '1.1rem',
    color: '#2d3748',
  },
  
  transactionAmount: {
    fontSize: '1.2rem',
    fontWeight: '700',
  },
  
  transactionDescription: {
    margin: '0',
    color: '#718096',
  },
  
  transactionDate: {
    color: '#a0aec0',
    fontSize: '0.8rem',
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