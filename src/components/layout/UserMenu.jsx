import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, RotateCcw, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ROLE_LABELS } from "../../lib/constants";
import { fullName } from "../../lib/format";
import { resetDemoData } from "../../services/db";
import { Avatar, ConfirmDialog, Menu } from "../ui";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const handleReset = () => {
    resetDemoData();
    setConfirmReset(false);
    toast("Demo data has been reset.");
  };

  return (
    <>
      <Menu
        label="Account"
        header={
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{fullName(user)}</p>
            <p className="truncate text-sm text-ink-muted">{user.email}</p>
          </div>
        }
        items={[
          { label: "My profile", icon: UserRound, to: "/profile" },
          { label: "Reset demo data", icon: RotateCcw, onSelect: () => setConfirmReset(true) },
          { divider: true },
          { label: "Sign out", icon: LogOut, onSelect: handleSignOut, tone: "danger" },
        ]}
        trigger={({ props, open }) => (
          <button
            type="button"
            {...props}
            aria-label={`Account menu for ${fullName(user)}`}
            className="flex h-11 items-center gap-2.5 rounded-lg pr-2 pl-1 transition-colors hover:bg-sunken aria-expanded:bg-sunken"
          >
            <Avatar person={user} size="sm" />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold text-ink">{user.firstName}</span>
              <span className="block text-xs text-ink-muted">{ROLE_LABELS[user.role]}</span>
            </span>
            <ChevronDown
              className={`hidden size-4 text-ink-muted transition-transform duration-150 sm:block ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}
      />
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Reset demo data?"
        description="All employees, tasks and notifications go back to the original sample data. Any changes you made will be lost."
        confirmLabel="Reset data"
      />
    </>
  );
}
