"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { sileo } from "sileo";
import { Ban, Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import FormError from "@/components/ui/form-error";
import { post } from "@/services/api";

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: z.string().min(6),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await post<User>("/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      sileo.success({
        title: "Registered!",
        description: "Logging you in...",
        icon: <Handshake className="size-3.5" />,
      });

      router.refresh();
      router.back();
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Registration failed",
        icon: <Ban className="size-3.5" />,
      });
    }
  };

  if (user) return null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white w-xs md:w-md p-4 rounded-md"
    >
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input {...register("username")} placeholder="Username" />
            {errors.username && (
              <FormError>{errors.username.message}</FormError>
            )}
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input {...register("email")} placeholder="Email" />
            {errors.email && <FormError>{errors.email.message}</FormError>}
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
            />
            {errors.password && (
              <FormError>{errors.password.message}</FormError>
            )}
          </Field>
        </FieldGroup>
        <Button type="submit">Register</Button>
      </FieldSet>
    </form>
  );
}
