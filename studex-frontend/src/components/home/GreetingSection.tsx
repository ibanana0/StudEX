interface GreetingSectionProps {
  userName: string;
}

export default function GreetingSection({ userName }: GreetingSectionProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-lg font-bold text-[#1A1A2E]">
        Halo, {userName}
      </h1>
      <p className="text-sm text-[#8E8E9A]">
        Apa yang ingin kamu beli sekarang?
      </p>
    </div>
  );
}
