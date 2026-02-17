"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { sileo } from "sileo";
import { Handshake, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import FormError from "@/components/ui/form-error";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      sileo.success({
        title: "Logged in!",
        description: "Redirecting...",
        icon: <Handshake className="size-3.5" />,
      });
      router.back();
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Login failed",
        icon: <Ban className="size-3.5" />,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white w-xs md:w-md p-4 rounded-md"
    >
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input {...register("email")} placeholder="Email" required />
            {errors.email && <FormError>{errors.email.message}</FormError>}
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
              required
            />
            {errors.password && (
              <FormError>{errors.password.message}</FormError>
            )}
          </Field>
        </FieldGroup>
        <Button type="submit">Login</Button>
      </FieldSet>
    </form>
  );
}
