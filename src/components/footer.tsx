"use client";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "1rem",
        textAlign: "center",
        borderTop: "1px solid #ccc",
        marginTop: "2rem",
      }}
    >
      <p>© {new Date().getFullYear()} FinTrack. Todos os direitos reservados.</p>
    </footer>
  );
}
