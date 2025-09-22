"use client";

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

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
    if (!transactions.length) return;

    const monthlyData = processMonthlyData(transactions);
    const categoryData = processCategoryData(transactions);

    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: monthlyData.labels,
            datasets: [
              {
                label: 'Receitas',
                data: monthlyData.income,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              },
              {
                label: 'Despesas',
                data: monthlyData.expenses,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Receitas vs Despesas por Mês'
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
    }

    if (pieChartRef.current) {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      const ctx = pieChartRef.current.getContext('2d');
      if (ctx && categoryData.labels.length > 0) {
        pieChartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: categoryData.labels,
            datasets: [{
              data: categoryData.values,
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                '#FF6384', '#36A2EB', '#FFCE56'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Despesas por Categoria'
              },
              legend: {
                position: 'right'
              }
            }
          }
        });
      }
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
      if (transaction.date) {
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
      if (transaction.type === 'expense' && transaction.category) {
        const category = transaction.category || 'Outros';
        categoryData[category] = (categoryData[category] || 0) + transaction.amount;
      }
    });
    
    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);
    
    return { labels, values };
  };

  if (transactions.length === 0) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        margin: '2rem 0'
      }}>
        <p>Nenhuma transação encontrada para exibir gráficos.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '2rem', 
      margin: '2rem 0',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Receitas vs Despesas</h3>
        <canvas ref={chartRef} style={{ width: '100%', height: '300px' }} />
      </div>
      <div>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Despesas por Categoria</h3>
        <canvas ref={pieChartRef} style={{ width: '100%', height: '300px' }} />
      </div>
    </div>
  );
}