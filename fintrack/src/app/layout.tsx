
import { ToastProvider } from '../context/ToastContext';

export const metadata = {
  title: 'FinTrack - Gestão Financeira',
  description: 'Sistema de gestão de gastos pessoais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}