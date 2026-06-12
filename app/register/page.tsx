import { RegisterForm } from '@/components/RegisterForm';

export const metadata = {
  title: 'Register - ExpenseTracker',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <RegisterForm />
    </main>
  );
}
