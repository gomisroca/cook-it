"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(3),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
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
      alert("Logged in!");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto mt-10 space-y-4"
    >
      <div>
        <input {...register("email")} placeholder="Email" className="input" />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="input"
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <button type="submit" className="btn">
        Login
      </button>
    </form>
  );
}
