interface PasswordStrengthProps {
  password: string;
}

const labels = ["", "Weak", "Fair", "Good", "Strong"];
const colors = ["", "bg-danger", "bg-warning", "bg-primary", "bg-success"];

function calculateStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const strength = calculateStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? colors[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="text-xs mt-1 text-muted-foreground">{labels[strength]}</p>
    </div>
  );
}
