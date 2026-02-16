"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { sileo } from "sileo";
import { Ban, Handshake } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: z.string().min(6),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.username, data.email, data.password);
      sileo.success({
        title: "Registered and Logged in!",
        icon: <Handshake className="size-3.5" />,
      });
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Registration failed",
        icon: <Ban className="size-3.5" />,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto mt-10 space-y-4"
    >
      <div>
        <input
          {...register("username")}
          placeholder="Username"
          className="input"
        />
        {errors.username && <p>{errors.username.message}</p>}
      </div>
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
        Register
      </button>
    </form>
  );
}
