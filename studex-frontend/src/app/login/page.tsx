import AuthHeader from '@/components/auth/AuthHeader';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1 px-6 pt-6 pb-4">
      <AuthHeader />
      <h1 className="text-4xl font-normal text-center mt-8 mb-8">Login</h1>
      <LoginForm />
    </div>
  );
}
