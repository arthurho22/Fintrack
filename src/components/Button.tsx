"use client";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
}

export default function Button({ onClick, children, type = "button", variant = "primary" }: ButtonProps) {
  const styles = variant === "primary"
    ? "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    : "border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50";

  return (
    <button type={type} onClick={onClick} className={styles}>
      {children}
    </button>
  );
}
