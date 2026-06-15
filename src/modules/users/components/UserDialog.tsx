import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/modules/common/FormDialog";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { getApiErrorMessage } from "@/shared/api/http";
import { toast } from "@/shared/lib/toast";
import type { AuthUser } from "@/modules/auth/authSlice";

const ROLES: AuthUser["role"][] = ["admin", "manager", "sales", "inventory"];

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  role: z.enum(["admin", "manager", "sales", "inventory"]),
  phone: z.string().trim().optional(),
  password: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  value: AuthUser | null;
  onSuccess: () => void;
}

export function UserDialog({ open, onOpenChange, mode, value, onSuccess }: Props) {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", role: "sales", phone: "", password: "" },
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (open) {
      form.reset(
        mode === "edit" && value
          ? {
              name: value.name,
              email: value.email,
              role: value.role,
              phone: value.phone ?? "",
              password: "",
            }
          : { name: "", email: "", role: "sales", phone: "", password: "" },
      );
    }
  }, [open, mode, value, form]);

  async function onSubmit(data: FormValues) {
    try {
      if (mode === "create") {
        if (!data.password || data.password.length < 6) {
          form.setError("password", { message: "Password (min 6 chars) is required" });
          return;
        }
        await createMutation.mutateAsync({
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          password: data.password,
        });
      } else if (value) {
        await updateMutation.mutateAsync({
          id: value.id,
          payload: {
            name: data.name,
            role: data.role,
            phone: data.phone,
            ...(data.password ? { password: data.password } : {}),
          },
        });
      }
      toast.success(mode === "create" ? "User created" : "User updated");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "New User" : "Edit User"}
      onSubmit={form.handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel={mode === "create" ? "Create User" : "Save Changes"}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Full Name *
          </label>
          <input className={inputCls} {...form.register("name")} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Email *</label>
          <input className={inputCls} disabled={mode === "edit"} {...form.register("email")} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Role *</label>
          <select className={inputCls} {...form.register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
          <input className={inputCls} {...form.register("phone")} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            {mode === "create" ? "Password *" : "Reset Password"}
          </label>
          <input
            type="password"
            className={inputCls}
            placeholder={mode === "edit" ? "Leave blank to keep" : ""}
            {...form.register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
      </div>
    </FormDialog>
  );
}
