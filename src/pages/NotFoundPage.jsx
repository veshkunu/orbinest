import { MapPinOff } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Button, EmptyState } from "../components/ui";

export function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <EmptyState page
      icon={MapPinOff}
      title="We can't find that page"
      description="The link may be old or mistyped. Head back to your dashboard to carry on."
      action={<Button to="/dashboard">Go to dashboard</Button>}
    />
  );
}
