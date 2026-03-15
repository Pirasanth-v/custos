import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login, me } from "@/features/auth/api";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo_crop.png";
import google_icon from "@/assets/google-icon.svg";
import { Copyright, ArrowRight } from "lucide-react";
import { useState } from "react";
import axios from "axios";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError("");
      await login(data);
      const user = await me();
      setUser(user);
      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status) {
          if (status === 401) {
            setServerError("Invalid email or password");
          } else {
            setServerError("Something went wrong, try again");
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/*Left side*/}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#11162c] to-[#6366F1] p-8">
        <div className="flex flex-col justify-between">
          {/* Header: Logo */}
          <div className="text-white/80 flex items-center">
            <img src={logo} alt="logo" className="h-auto w-30"></img>
            <div>
              <h1 className="text-2xl font-bold text-white">Custos</h1>
              <p className="text-sm text-muted-background">
                Guard your finances
              </p>
            </div>
          </div>

          {/* Body */}
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

          {/* Footer */}
          <div className="flex items-center text-white/40 gap-2">
            <Copyright size={20} />
            <p className="text-sm">2026 Custos. All rights reserved</p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex justify-center items-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col justify-center items-center">
            <img src={logo} alt="logo" className="h-auto w-30"></img>
            <h1 className="font-bold text-2xl text-foreground">Custos</h1>
            <p className="text-sm text-muted-foreground">Guard your finances</p>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col space-y-5"
          >
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
                placeholder="Password"
                className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
              />
              {errors.password && (
                <p className="text-danger text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            {serverError && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-3 rounded-lg">
                {serverError}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex justify-center items-center gap-1 rounded-lg bg-primary  hover:bg-[#5558E3] w-full h-11 text-base font-medium shadow-sm text-white"
            >
              {isSubmitting ? (
                "Logging in..."
              ) : (
                <>
                  Login
                  <ArrowRight size={20} className="mt-0.5" />
                </>
              )}
            </button>
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
          <button className="text-foreground text-sm flex gap-3 h-11 w-full justify-center items-center rounded-lg border bg-border/50  hover:bg-border">
            <img src={google_icon} alt="google logo" className="w-5" />
            Continue with google
          </button>

          {/* Signup */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-primary hover:text-[#5558E3] font-medium transition-colors"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              Register
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
