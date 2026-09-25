"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import AuthTransitionLink from "./transitions/AuthTransitionLink";

const fieldClassName =
  "mt-2 w-full rounded-xs border border-black/40 bg-white px-4 py-4 text-base outline-none transition-[background-color,border-color] duration-300 placeholder:text-black/35 focus:border-black focus:bg-[#f3faff]";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setError("");
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const credentials = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const result = isRegister
        ? await signUp.email({
            ...credentials,
            name: String(formData.get("name") ?? "").trim(),
          })
        : await signIn.email(credentials);

      if (result.error) {
        throw new Error(result.error.message ?? "An error occurred.");
      }

      router.push("/account");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "An error occurred.",
      );
      setIsPending(false);
    }
  }

  return (
    <>
      <header className="relative flex min-h-72 flex-col justify-between border-b border-black bg-black p-7 text-white after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-white sm:p-10 lg:min-h-[36rem] lg:border-b-0 lg:border-r">
        <div
          data-auth-transition-content
          className="relative z-10 flex h-full flex-col justify-between"
        >
          <div className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-white/70">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[var(--main-highlight)]"
            />
            Personal space
          </div>

          <div className="py-12 lg:py-0">
            <h1 className="max-w-[8ch] text-[clamp(3.8rem,8vw,7.5rem)] font-medium leading-[0.82] tracking-[-0.07em]">
              {isRegister ? "Create an account" : "Welcome back"}
            </h1>
            <p className="mt-7 max-w-sm text-sm leading-6 text-white/60">
              Save your favorite artworks and build a personal collection
              spanning eras and artistic movements.
            </p>
          </div>

          <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/40">
            The Art Project — Private collection
          </p>
        </div>
      </header>

      <div className="flex flex-col justify-between bg-white">
        <div
          data-auth-transition-content
          className="flex h-full flex-col justify-between"
        >
          <div className="border-b border-black px-7 py-5 sm:px-10 lg:px-16">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-black/55">
              {isRegister ? "New registration" : "Sign in"}
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-center p-7 sm:p-10 lg:px-16 lg:py-12">
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl">
              {isRegister && (
                <label className="block">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]">
                    Name
                  </span>
                  <input
                    name="name"
                    autoComplete="name"
                    minLength={2}
                    required
                    className={fieldClassName}
                    placeholder="Your name"
                  />
                </label>
              )}

              <label className={`block ${isRegister ? "mt-6" : ""}`}>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]">
                  Email address
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={fieldClassName}
                  placeholder="you@example.com"
                />
              </label>

              <label className="mt-6 block">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  minLength={8}
                  required
                  className={fieldClassName}
                  placeholder="8 characters minimum"
                />
              </label>

              {error && (
                <p
                  className="mt-5 rounded-xs border border-red-700 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="group relative mt-8 inline-flex w-fit items-center justify-between gap-10 rounded-xs border border-black bg-black px-6 py-4 text-xs uppercase tracking-[0.14em] text-white transition-[background-color,color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-white after:transition-[border-color,border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:text-black hover:after:rounded-sm hover:after:border-black focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:after:rounded-sm focus-visible:after:border-black disabled:cursor-wait disabled:opacity-50"
              >
                {isPending
                  ? "One moment…"
                  : isRegister
                    ? "Create my account"
                    : "Sign in"}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1"
                >
                  →
                </span>
              </button>
            </form>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 border-t border-black bg-white px-7 py-5 text-sm sm:flex-row sm:items-center sm:px-10 lg:px-16">
            <span className="text-black/55">
              {isRegister ? "Already registered?" : "No account yet?"}
            </span>
            <AuthTransitionLink
              href={isRegister ? "/login" : "/register"}
              className="relative inline-flex w-fit rounded-xs border border-black bg-white px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.12em] text-black transition-[background-color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:after:rounded-sm"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </AuthTransitionLink>
          </div>
        </div>
      </div>
    </>
  );
}
