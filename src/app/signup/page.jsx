import AuthForm from "@/components/auth/AuthForm";
import { signUpWithPassword } from "@/lib/auth/actions";

export const metadata = { title: "Create Account — Meridian" };

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const notice = params?.check_email
    ? "Check your inbox for a confirmation link to finish creating your account."
    : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <AuthForm mode="signup" action={signUpWithPassword} error={params?.error} notice={notice} />
    </div>
  );
}
