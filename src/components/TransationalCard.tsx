"use client";

interface TransactionCardProps {
  description: string;
  amount: number;
  type: "income" | "expense";
}

export default function TransactionCard({ description, amount, type }: TransactionCardProps) {
  return (
    <div className={`p-4 border rounded ${type === "income" ? "border-green-400" : "border-red-400"}`}>
      <p>{description}</p>
      <p className={type === "income" ? "text-green-500" : "text-red-500"}>
        {type === "income" ? "+" : "-"} R$ {amount.toFixed(2)}
      </p>
    </div>
  );
}
