import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  locale: string;
  label: string;
};

export function LogoutButton({ locale, label }: LogoutButtonProps) {
  return (
    <form action={logoutAction.bind(null, locale)}>
      <Button type="submit" variant="outline">
        {label}
      </Button>
    </form>
  );
}
