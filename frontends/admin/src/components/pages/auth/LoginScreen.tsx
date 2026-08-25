import { LoginShowcase } from "./LoginShowcase";
import { LoginForm } from "./LoginForm";

interface LoginScreenProps {
  showDemo?: boolean;
}

export function LoginScreen({ showDemo = false }: LoginScreenProps) {
  return (
    <main className="relative grid grid-cols-1 md:grid-cols-2 min-h-screen w-full max-w-full overflow-x-hidden bg-background">
      <LoginShowcase />
      <section className="flex min-h-screen items-center justify-center px-8 py-16 md:px-16 lg:px-24">
        <LoginForm showDemo={showDemo} />
      </section>
    </main>
  );
}
