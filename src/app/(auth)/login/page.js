import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Sign in | Art Gallery",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
