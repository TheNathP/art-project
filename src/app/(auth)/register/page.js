import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Create an account | Art Gallery",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
