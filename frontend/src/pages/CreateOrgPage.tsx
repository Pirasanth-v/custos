import { createOrganization } from "@/features/organization/api";
import { useState } from "react";
import { Building, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

// Zod schema for form validation
const orgSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
});

type OrgFormData = z.infer<typeof orgSchema>;

export default function CreateOrganizationPage() {
  const [serverError, setServerError] = useState<string>("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
    },
  });

  const onSubmit = async (data: OrgFormData) => {
    setServerError("");
    try {
      await createOrganization(data);
      reset();
      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 403) {
          setServerError("You are not allowed to perform this action.");
        } else {
          setServerError("Something went wrong. Please try again.");
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Column: Branding & Value Props */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex relative overflow-hidden">
        {/* Abstract background subtle pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <Building className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Custos</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            Build your team's <br /> financial future.
          </h2>
          <p className="mt-6 text-lg text-white/80 leading-relaxed">
            Organizations in Custos allow you to collaborate with teammates,
            track shared expenses, and manage organization-wide budgets with
            unmatched clarity.
          </p>

          <div className="mt-12 space-y-6">
            {[
              {
                title: "Shared Ledgers",
                desc: "Real-time visibility into every transaction.",
              },
              {
                title: "Smart Approvals",
                desc: "Set up workflows for multi-user authorization.",
              },
              {
                title: "Detailed Analytics",
                desc: "Understand your cash flow with advanced charts.",
              },
            ].map((prop, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                <div>
                  <h4 className="font-bold">{prop.title}</h4>
                  <p className="text-sm text-white/70">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-white/50">
          © 2026 Custos Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column: The Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col gap-2 lg:hidden">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white mb-2">
              <Building className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Create Organization
            </h1>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Welcome aboard.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Let's start by setting up your organization's core profile.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-10 space-y-6"
            noValidate
          >
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-bold text-foreground/80 mb-1.5 px-0.5"
                  htmlFor="org-name"
                >
                  Organization Name
                </label>
                <input
                  id="org-name"
                  {...register("name")}
                  placeholder="Acme International Ltd."
                  className={`flex h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-ring transition-all ${
                    errors.name
                      ? "border-danger ring-danger/20"
                      : "hover:border-primary/50"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs font-medium text-danger px-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-bold text-foreground/80 mb-1.5 px-0.5"
                  htmlFor="org-email"
                >
                  Business Email
                </label>
                <input
                  type="email"
                  id="org-email"
                  {...register("email")}
                  placeholder="contact@acme.com"
                  className={`flex h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-none transition-all ${
                    errors.email
                      ? "border-danger ring-danger/20"
                      : "hover:border-primary/50"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-danger px-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-bold text-foreground/80 mb-1.5 px-0.5"
                  htmlFor="org-address"
                >
                  Primary Address{" "}
                  <span className="text-xs font-normal text-muted-foreground/60">
                    (Optional)
                  </span>
                </label>
                <textarea
                  id="org-address"
                  {...register("address")}
                  rows={4}
                  placeholder="123 Financial Way, Suit 400..."
                  className="flex w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-none transition-all hover:border-primary/50 resize-none"
                />
              </div>
            </div>

            {serverError && (
              <div className="flex items-center gap-3 rounded-xl bg-danger/10 p-4 text-sm font-medium text-danger border border-danger/20 animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="h-4 w-4" />
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-primary px-4 text-sm font-bold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="flex items-center gap-2 transition-transform duration-200 group-hover:-translate-x-1">
                {isSubmitting ? (
                  "Establishing Workspace..."
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-2" />
                  </>
                )}
              </div>
            </button>
          </form>

          <footer className="mt-12 text-center text-xs text-muted-foreground lg:hidden">
            © 2024 Custos Inc. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}
