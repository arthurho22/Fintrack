import { db } from '../firebase/config';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  userEmail: string;
}

export const getTransactions = async (userEmail: string): Promise<Transaction[]> => {
  try {
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userEmail', '==', userEmail),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(transactionsQuery);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      } as Transaction);
    });
    
    return transactions;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return [];
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), transaction);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  console.log('Deletar transação:', transactionId);
};