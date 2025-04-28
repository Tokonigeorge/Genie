import { AuthProvider } from './contexts/AuthContext';

export default function App({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
