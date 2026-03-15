import { useState } from "react";
import logo from "@/assets/logo_crop.png";
import { login, me } from "@/features/auth/api";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Copyright } from "lucide-react";
import google_icon from "@/assets/google-icon.svg";
import useAuthStore from "@/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      const user = await me();
      setUser(user);
      navigate("/Dashboard");
    } catch {
      setError("Error occured");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/*Left side*/}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] p-8">
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

      {/*Right side*/}
      <div className="flex-1 flex items-center justify-center p-8">
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
          {error && <p>{error}</p>}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col justify-center space-y-5"
          >
            <div className="space-y-2">
              <h2 className="text-foreground">Email address</h2>
              <input
                className="border text-muted-foreground rounded-lg h-11 w-full p-3 focus:outline-none focus:border-primary"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-foreground">Password</h2>
              <input
                className="border text-muted-foreground rounded-lg h-11 w-full p-3 focus:outline-none focus:border-primary"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            <button
              type="submit"
              className="flex justify-center items-center gap-1 rounded-lg bg-primary hover:bg-[#5558E3] w-full h-11 text-base font-medium shadow-sm text-white"
            >
              Login
              <ArrowRight size={20} className="mt-0.5" />
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
