import { createOrganization } from "@/features/organization/api";
import { useState } from "react";
import { Building, ArrowRight } from "lucide-react";
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
      // Use axios error detection for custom messaging
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status) {
          if (status == 403) {
            setServerError("you are not allowed to perform this action");
          } else {
            setServerError("something went wrong, try again");
          }
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 gap-5">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6366F1] mb-4">
        <Building className="w-8 h-8 text-white" />
      </div>
      <div className="flex flex-col justify-center items-center pb-2">
        <h1 className="text-3xl text-foreground font-bold mb-2">
          Create Your Organization
        </h1>
        <p className="text-muted-foreground">
          Set up your organization to start managing finances with Custos
        </p>
      </div>
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {/* Name */}
          <div>
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="org-name"
            >
              Organization Name *
            </label>
            <input
              id="org-name"
              {...register("name")}
              required
              placeholder="e.g. Acme Corp"
              className={`mt-1 text-muted-foreground w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ${
                errors.name ? "border-danger" : ""
              }`}
            />
            {errors.name && (
              <p className="text-danger text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="org-email"
            >
              Email *
            </label>
            <input
              type="email"
              id="org-email"
              {...register("email")}
              required
              placeholder="contact@company.com"
              className={`mt-1 w-full text-muted-foreground rounded-lg border border-border bg-background px-3 py-2 text-sm ${
                errors.email ? "border-danger" : ""
              }`}
            />
            {errors.email && (
              <p className="text-danger text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="org-address"
            >
              Address
            </label>
            <textarea
              id="org-address"
              {...register("address")}
              rows={3}
              placeholder="Company address"
              className="mt-1 w-full text-muted-foreground rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            {errors.address && (
              <p className="text-danger text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Display server-side error */}
          {serverError && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-primary py-2 text-sm font-medium text-white hover:opacity-90 gap-1"
          >
            {isSubmitting ? (
              "Creating..."
            ) : (
              <>
                Create Organization
                <ArrowRight size={20} className="mt-0.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
