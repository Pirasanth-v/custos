import { register as registerUser } from "@/features/auth/api";
import { Copyright, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo_crop.png";
import google_icon from "@/assets/google-icon.svg";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { PasswordStrength } from "@/components/PasswordStrength";
import axios from "axios";

const registerSchema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm_password: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = useWatch({
    control,
    name: "password",
  });
  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    try {
      const { confirm_password: _confirm_password, ...userData } = data;
      await registerUser(userData);
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status == 409) {
          setServerError("Email already in use");
        } else if (status === 429) {
          setServerError("Too many requests, please try again later");
        } else {
          setServerError("Registration failed. Please try again.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#11162c] to-[#6366F1] p-8">
        <div className="flex flex-col justify-between h-full">
          <div className="text-white/80 flex items-center">
            <img src={logo} alt="logo" className="h-auto w-30" />
            <div>
              <h1 className="text-2xl font-bold text-white">Custos</h1>
              <p className="text-sm text-muted-background">
                Guard your finances
              </p>
            </div>
          </div>
          <div className="space-y-6 text-white">
            <h1 className="text-4xl font-bold leading-tight">
              Enterprise Financial
              <br />
              Management Platform
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Streamline your financial operations with powerful tools for
              tracking, approvals, and reporting.
            </p>
          </div>
          <div className="flex items-center text-white/40 gap-2">
            <Copyright size={20} />
            <p className="text-sm">2026 Custos. All rights reserved</p>
          </div>
        </div>
      </div>

      {/* Right side: Registration form */}
      <div className="flex-1 flex justify-center items-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col justify-center items-center">
            <img src={logo} alt="logo" className="h-auto w-30" />
            <h1 className="font-bold text-2xl text-foreground">Custos</h1>
            <p className="text-sm text-muted-foreground">Guard your finances</p>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-bold">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Get started with Custos in just a few minutes
            </p>
          </div>

          {/* Form */}
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 space-y-5"
          >
            {/* First name & Last name */}
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <h2 className="text-foreground text-sm font-medium">
                  First Name
                </h2>
                <input
                  {...register("first_name")}
                  type="text"
                  placeholder="Nico"
                  className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
                />
                {errors.first_name && (
                  <p className="text-danger text-sm mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <h2 className="text-foreground text-sm font-medium">
                  Last Name
                </h2>
                <input
                  {...register("last_name")}
                  type="text"
                  placeholder="Robin"
                  className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
                />
                {errors.last_name && (
                  <p className="text-danger text-sm mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <h2 className="text-foreground text-sm font-medium">
                Email address
              </h2>
              <input
                {...register("email")}
                type="email"
                placeholder="name@company.com"
                className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
              />
              {errors.email && (
                <p className="text-danger text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <h2 className="text-foreground text-sm font-medium">Password</h2>
              <input
                {...register("password")}
                type="password"
                placeholder="Create a strong password"
                className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
              />
              <PasswordStrength password={password} />
              {errors.password && (
                <p className="text-danger text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <h2 className="text-foreground text-sm font-medium">
                Re-enter password
              </h2>
              <input
                {...register("confirm_password")}
                type="password"
                placeholder="Re-enter your password"
                className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
              />
              {errors.confirm_password && (
                <p className="text-danger text-sm mt-1">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Display server-side error */}
            {serverError && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-3 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Register button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex justify-center items-center gap-1 rounded-lg bg-primary hover:bg-[#5558E3] w-full h-11 text-base font-medium shadow-sm text-white"
            >
              {isSubmitting ? (
                "Registering..."
              ) : (
                <>
                  Register
                  <ArrowRight size={20} className="mt-0.5" />
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              By creating an account, you agree to our{" "}
              <a
                href="#"
                className="text-primary hover:text-[#5558E3] font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-primary hover:text-[#5558E3] font-medium"
              >
                Privacy Policy
              </a>
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center">
            <hr className="border-gray-400 flex-1" />
            <p className="text-muted-foreground px-3 text-xs">
              OR CONTINUE WITH
            </p>
            <hr className="border-gray-400 flex-1" />
          </div>

          {/* Google signup */}
          <button className="text-foreground text-sm flex gap-3 h-11 w-full justify-center items-center rounded-lg border bg-border/50 hover:bg-border">
            <img src={google_icon} alt="google logo" className="w-5" />
            Continue with google
          </button>

          {/* Sign in */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary hover:text-[#5558E3] font-medium transition-colors"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Login
            </a>
          </p>

          {/* Footer */}
          <div className="lg:hidden flex items-center justify-center text-white/40 gap-2">
            <Copyright size={20} />
            <p className="text-sm">2026 Custos. All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
