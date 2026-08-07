"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { fazerLogin, type EstadoLogin } from "@/app/(auth)/entrar/action";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const estadoInicial: EstadoLogin = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button type="submit" className="w-full">{pending ? "Entrando..." : "Entrar"}</Button>;
}

export function LoginForm() {
  const [state, action] = useActionState(fazerLogin, estadoInicial);

  return (
    <form action={action} className="space-y-4">
      <Field label="E-mail">
        <Input type="email" name="email" placeholder="personal@fitcontrol.com" required />
      </Field>

      <Field label="Senha">
        <Input type="password" name="senha" placeholder="Sua senha" required />
      </Field>

      {state.error ? (
        <Alert title="Não foi possível entrar" tone="danger">
          {state.error}
        </Alert>
      ) : null}

      <SubmitButton />
    </form>
  );
}
