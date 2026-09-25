"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient, signOut } from "@/lib/auth-client";

const inputClassName =
  "w-full rounded-xs border border-black/35 bg-white px-4 py-3.5 text-sm outline-none transition-[background-color,border-color] placeholder:text-black/35 focus:border-black focus:bg-[#f3faff]";
const buttonClassName =
  "relative inline-flex w-fit items-center gap-6 rounded-xs border border-black bg-white px-5 py-3.5 text-[0.67rem] uppercase tracking-[0.13em] text-black transition-[background-color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:after:rounded-sm disabled:cursor-wait disabled:opacity-40";

export default function AccountSettings({ user }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState("");
  const [feedback, setFeedback] = useState(null);

  async function runAction(action, callback) {
    if (pendingAction) {
      return;
    }

    setPendingAction(action);
    setFeedback(null);

    try {
      const result = await callback();

      if (result?.error) {
        throw new Error(result.error.message ?? "An error occurred.");
      }

      setFeedback({ type: "success", message: "Changes saved." });
      router.refresh();
      return true;
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred.",
      });
      return false;
    } finally {
      setPendingAction("");
    }
  }

  function updateProfile(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();

    return runAction("profile", () => authClient.updateUser({ name }));
  }

  function updateEmail(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEmail = String(formData.get("email") ?? "").trim();

    return runAction("email", () => authClient.changeEmail({ newEmail }));
  }

  function updatePassword(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    return runAction("password", () =>
      authClient.changePassword({
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
        revokeOtherSessions: true,
      }),
    );
  }

  async function deleteAccount(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (formData.get("confirmation") !== "DELETE") {
      setFeedback({
        type: "error",
        message: "Type DELETE to confirm account deletion.",
      });
      return;
    }

    const wasDeleted = await runAction("delete", () =>
      authClient.deleteUser({
        password: String(formData.get("password") ?? ""),
      }),
    );

    if (!wasDeleted) {
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleSignOut() {
    setPendingAction("signout");
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <section>
      <div className="mb-10 flex flex-col justify-between gap-6 border-b border-black pb-8 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">
            02 — Account
          </p>
          <h2 className="mt-4 text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.9] tracking-[-0.055em]">
            Manage my profile
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-black/60">
          Update your personal information and sign-in details.
        </p>
      </div>

      <div className="rounded-xs border border-black bg-white">
        <header className="relative grid gap-8 border-b border-black bg-[var(--main-highlight)] p-6 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="relative z-10 min-w-0">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-black/50">
              Active profile
            </p>
            <p className="mt-5 break-words text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.9] tracking-[-0.055em]">
              {user.name}
            </p>
            <p className="mt-4 break-all text-sm text-black/60">{user.email}</p>
          </div>

          <div className="relative z-10">
            <button
              type="button"
              disabled={Boolean(pendingAction)}
              onClick={handleSignOut}
              className={buttonClassName}
            >
              {pendingAction === "signout" ? "Signing out…" : "Sign out"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </header>

        <div>
          <form
            onSubmit={updateProfile}
            className="grid gap-7 border-b border-black p-6 sm:p-9 lg:grid-cols-[minmax(12rem,0.65fr)_minmax(0,1fr)] lg:gap-16"
          >
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-black/45">
                01 — Information
              </p>
              <h3 className="mt-3 text-2xl tracking-[-0.03em]">Display name</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-black/55">
                The name displayed in your personal space.
              </p>
            </div>
            <div className="flex flex-col items-start justify-center">
              <label htmlFor="account-name" className="sr-only">
                Display name
              </label>
              <input
                id="account-name"
                name="name"
                defaultValue={user.name}
                minLength={2}
                required
                className={inputClassName}
              />
              <button
                type="submit"
                disabled={Boolean(pendingAction)}
                className={`${buttonClassName} mt-4`}
              >
                {pendingAction === "profile" ? "Saving…" : "Update"}
              </button>
            </div>
          </form>

          <form
            onSubmit={updateEmail}
            className="grid gap-7 border-b border-black p-6 sm:p-9 lg:grid-cols-[minmax(12rem,0.65fr)_minmax(0,1fr)] lg:gap-16"
          >
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-black/45">
                02 — Sign-in
              </p>
              <h3 className="mt-3 text-2xl tracking-[-0.03em]">
                Email address
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-black/55">
                The email address used to sign in to your account.
              </p>
            </div>
            <div className="flex flex-col items-start justify-center">
              <label htmlFor="account-email" className="sr-only">
                Email address
              </label>
              <input
                id="account-email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={user.email}
                required
                className={inputClassName}
              />
              <button
                type="submit"
                disabled={Boolean(pendingAction)}
                className={`${buttonClassName} mt-4`}
              >
                {pendingAction === "email" ? "Saving…" : "Update"}
              </button>
            </div>
          </form>

          <form
            onSubmit={updatePassword}
            className="grid gap-7 p-6 sm:p-9 lg:grid-cols-[minmax(12rem,0.65fr)_minmax(0,1fr)] lg:gap-16"
          >
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-black/45">
                03 — Security
              </p>
              <h3 className="mt-3 text-2xl tracking-[-0.03em]">Password</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-black/55">
                Changing it will sign you out of your other active sessions.
              </p>
            </div>
            <div className="flex flex-col items-start justify-center">
              <label htmlFor="current-password" className="sr-only">
                Current password
              </label>
              <input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className={inputClassName}
                placeholder="Current password"
              />
              <label htmlFor="new-password" className="sr-only">
                New password
              </label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className={`${inputClassName} mt-3`}
                placeholder="New password"
              />
              <button
                type="submit"
                disabled={Boolean(pendingAction)}
                className={`${buttonClassName} mt-4`}
              >
                {pendingAction === "password" ? "Saving…" : "Change password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <form
        onSubmit={deleteAccount}
        className="relative mt-5 grid gap-7 rounded-xs border border-black bg-[#181818] p-6 text-white after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-white sm:p-9 lg:grid-cols-[minmax(12rem,0.65fr)_minmax(0,1fr)] lg:gap-16"
      >
        <div className="relative z-10">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/45">
            04 — Sensitive area
          </p>
          <h3 className="mt-3 text-2xl tracking-[-0.03em]">Delete account</h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">
            This action permanently deletes the account and all its favorites.
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-start justify-center">
          <label htmlFor="delete-confirmation" className="sr-only">
            Type DELETE to confirm
          </label>
          <input
            id="delete-confirmation"
            name="confirmation"
            required
            className={`${inputClassName} border-white/35 bg-transparent text-white placeholder:text-white/35 focus:border-white focus:bg-white/5`}
            placeholder="Type DELETE"
          />
          <label htmlFor="delete-password" className="sr-only">
            Current password
          </label>
          <input
            id="delete-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`${inputClassName} mt-3 border-white/35 bg-transparent text-white placeholder:text-white/35 focus:border-white focus:bg-white/5`}
            placeholder="Current password"
          />
          <button
            type="submit"
            disabled={Boolean(pendingAction)}
            className="relative mt-4 inline-flex w-fit items-center gap-6 rounded-xs border border-white bg-transparent px-5 py-3.5 text-[0.67rem] uppercase tracking-[0.13em] text-white transition-[background-color,color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-white after:transition-[border-color,border-radius] after:duration-300 hover:rounded-md hover:bg-white hover:text-black hover:after:rounded-sm hover:after:border-black focus-visible:rounded-md focus-visible:bg-white focus-visible:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:after:rounded-sm focus-visible:after:border-black disabled:cursor-wait disabled:opacity-40"
          >
            {pendingAction === "delete" ? "Deleting…" : "Delete"}
          </button>
        </div>
      </form>

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`mt-6 w-fit rounded-xs border border-black px-5 py-4 text-sm ${
            feedback.type === "error"
              ? "bg-red-100 text-red-900"
              : "bg-[var(--main-highlight)] text-black"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </section>
  );
}
