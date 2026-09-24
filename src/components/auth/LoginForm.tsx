"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DEMO_CREDENTIALS } from "@/lib/auth/constants";

export function LoginForm() {
  const { login, isLoggingIn, loginError, clearLoginError } = useAuth();
  const [username, setUsername] = useState<string>(DEMO_CREDENTIALS.username);
  const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.password);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!username.trim()) next.username = "Username is required.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isLoggingIn) return;
    clearLoginError();
    if (!validate()) return;
    await login({ username: username.trim(), password });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Username"
        name="username"
        autoComplete="username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
        }}
        error={errors.username}
        required
        disabled={isLoggingIn}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
        required
        disabled={isLoggingIn}
      />

      {loginError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {loginError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        loading={isLoggingIn}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
