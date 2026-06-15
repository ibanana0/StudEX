import AuthHeader from '@/components/auth/AuthHeader';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-col flex-1 px-6 pt-6 pb-4">
      <AuthHeader />
      <h1 className="text-4xl font-normal text-center mt-8 mb-8">Sign Up</h1>
      <RegisterForm />
    </div>
  );
}
