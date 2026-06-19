import { LoginForm } from '@/components/LoginForm';

export const metadata = {
  title: 'Login - ExpenseTracker',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <LoginForm />
    </main>
  );
}
