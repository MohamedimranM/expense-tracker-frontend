import { LoginForm } from '@/components/LoginForm';

export const metadata = {
  title: 'Login - ExpenseTracker',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <LoginForm />
    </main>
  );
}
