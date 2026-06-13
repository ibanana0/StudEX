import AuthHeader from '@/components/auth/AuthHeader';
import RegisterForm from '@/components/auth/RegisterForm';
import BottomNav from '@/components/ui/BottomNav';

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-white">
      <div className="flex flex-col px-6 pt-6 pb-4">
        <AuthHeader />
        <h1 className="text-4xl font-normal text-center mt-8 mb-8">Sign Up</h1>
        <RegisterForm />
      </div>
      <BottomNav />
    </div>
  );
}
