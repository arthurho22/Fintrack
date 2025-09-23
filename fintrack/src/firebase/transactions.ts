import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './config';

export interface Transaction {
  id: string; 
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  userId: string;
}

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('Usuário não autenticado');
      return [];
    }

    console.log('Buscando transações para usuário:', user.uid);
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);

    const transactions: Transaction[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log('Transação encontrada:', data);
      
      return {
        id: doc.id,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date?.toDate() || new Date(),
        userId: data.userId,
      };
    });
    
    console.log(`Total de transações encontradas: ${transactions.length}`);
    return transactions;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return [];
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      userId: user.uid,
      date: Timestamp.fromDate(transaction.date),
    });

    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }
};
