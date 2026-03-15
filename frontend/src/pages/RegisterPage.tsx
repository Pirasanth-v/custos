import { register } from "@/features/auth/api";
import { Copyright, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo_crop.png";
import google_icon from "@/assets/google-icon.svg";

export default function RegisterPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await register({
        first_name: firstname,
        last_name: lastname,
        email,
        password,
      });
      navigate("/login");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary to-[#4F46E5] p-8">
        <div className="flex flex-col justify-between">
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

          {error && <p className="text-red-500 text-xs">{error}</p>}
          <form onSubmit={handleSubmit} className="flex-1 space-y-5">
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <h2 className="text-foreground text-sm font-medium">
                  First Name
                </h2>
                <input
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="James"
                  autoComplete="given-name"
                  className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2 flex-1">
                <h2 className="text-foreground text-sm font-medium">
                  Last Name
                </h2>
                <input
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Bond"
                  autoComplete="family-name"
                  className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-foreground text-sm font-medium">Email</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
                className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-foreground text-sm font-medium">Password</h2>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-foreground text-sm font-medium">
                Re-enter password
              </h2>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="border text-muted-foreground rounded-lg h-11 w-full px-3 focus-visible:outline-none focus-visible:ring-1 focus:ring-ring focus:border-primary/50"
                required
              />
            </div>
            <button
              type="submit"
              className="flex justify-center items-center gap-1 rounded-lg bg-primary hover:bg-[#5558E3] w-full h-11 text-base font-medium shadow-sm text-white"
            >
              Create account
              <ArrowRight size={20} className="mt-0.5" />
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
