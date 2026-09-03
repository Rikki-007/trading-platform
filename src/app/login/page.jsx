import AuthForm from "@/components/auth/AuthForm";
import { signInWithPassword } from "@/lib/auth/actions";

export const metadata = { title: "Sign In — Meridian" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <AuthForm mode="login" action={signInWithPassword} error={params?.error} />
    </div>
  );
}
