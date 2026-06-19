import { RegisterForm } from '@/components/RegisterForm';

export const metadata = {
  title: 'Register - ExpenseTracker',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen">
      <RegisterForm />
    </main>
  );
}
