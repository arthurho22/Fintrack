import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  deleteDoc,
  doc 
} from "firebase/firestore";
import { db, auth } from "../firebase/config";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: Date;
  userId: string;
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  const q = query(
    collection(db, "transactions"),
    where("userId", "==", user.uid),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: data.date.toDate(),
      userId: data.userId,
    };
  });
};

export const addTransaction = async (
  transaction: Omit<Transaction, "id" | "userId">
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  await addDoc(collection(db, "transactions"), {
    ...transaction,
    userId: user.uid,
    date: Timestamp.fromDate(transaction.date),
  });
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  await deleteDoc(doc(db, "transactions", transactionId));
};
