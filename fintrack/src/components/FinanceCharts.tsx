
"use client";

import { useEffect, useRef } from 'react';
 import { Chart } from "chart.js"; 


interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: any;
  category?: string;
}

interface FinanceChartsProps {
  transactions: Transaction[];
}

export default function FinanceCharts({ transactions }: FinanceChartsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);

  const chartInstance = useRef<Chart | null>(null);
  const pieChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!transactions.length || !chartRef.current || !pieChartRef.current) return;

    const monthlyData = processMonthlyData(transactions);
    const categoryData = processCategoryData(transactions);

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthlyData.labels,
          datasets: [
            {
              label: 'Receitas',
              data: monthlyData.income,
              backgroundColor: '#10b981',
              borderColor: '#047857',
              borderWidth: 1
            },
            {
              label: 'Despesas',
              data: monthlyData.expenses,
              backgroundColor: '#ef4444',
              borderColor: '#dc2626',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Receitas vs Despesas por Mês',
              font: { size: 16 }
            },
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Valor (R$)'
              }
            }
          }
        }
      });
    }

    const pieCtx = pieChartRef.current.getContext('2d');
    if (pieCtx && categoryData.labels.length > 0) {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      pieChartInstance.current = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: categoryData.labels,
          datasets: [{
            data: categoryData.values,
            backgroundColor: [
              '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
              '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
              '#ec4899', '#6366f1'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Despesas por Categoria',
              font: { size: 16 }
            },
            legend: {
              position: 'right'
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
    };
  }, [transactions]);

  const processMonthlyData = (transactions: Transaction[]) => {
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
    
    transactions.forEach(transaction => {
      if (!transaction.date) return;
      
      try {
        const date = transaction.date.toDate ? transaction.date.toDate() : new Date(transaction.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { income: 0, expenses: 0 };
        }
        
        if (transaction.type === 'income') {
          monthlyData[monthYear].income += transaction.amount;
        } else {
          monthlyData[monthYear].expenses += transaction.amount;
        }
      } catch (error) {
        console.error('Erro ao processar data:', error);
      }
    });
    
    const labels = Object.keys(monthlyData).sort();
    const income = labels.map(label => monthlyData[label].income);
    const expenses = labels.map(label => monthlyData[label].expenses);
    
    return { labels, income, expenses };
  };

  const processCategoryData = (transactions: Transaction[]) => {
    const categoryData: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const category = transaction.category || 'Outras';
        categoryData[category] = (categoryData[category] || 0) + transaction.amount;
      }
    });
    
    // Ordenar por valor (maior para menor)
    const sortedEntries = Object.entries(categoryData)
      .sort(([,a], [,b]) => b - a);
    
    return {
      labels: sortedEntries.map(([label]) => label),
      values: sortedEntries.map(([,value]) => value)
    };
  };

  if (transactions.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem', 
        color: '#666',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        margin: '2rem 0'
      }}>
        <h3>📊 Gráficos Financeiros</h3>
        <p>Adicione transações para visualizar os gráficos</p>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      margin: '2rem 0'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center' }}>📊 Análise Financeira</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        alignItems: 'start'
      }}>
        <div>
          <div style={{ height: '300px' }}>
            <canvas ref={chartRef} />
          </div>
        </div>
        
        <div>
          <div style={{ height: '300px' }}>
            <canvas ref={pieChartRef} />
          </div>
        </div>
      </div>
      
      {transactions.filter(t => t.type === 'expense').length === 0 && (
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginTop: '1rem',
          fontStyle: 'italic'
        }}>
          💡 Adicione despesas para ver a distribuição por categoria
        </p>
      )}
    </div>
  );
}