import AuthTransitionShell from "@/components/transitions/AuthTransitionShell";

export default function AuthLayout({ children }) {
  return <AuthTransitionShell>{children}</AuthTransitionShell>;
}
