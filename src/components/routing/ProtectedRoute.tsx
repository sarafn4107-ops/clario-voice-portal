import { Navigate } from "react-router-dom";
import { useSession } from "@/lib/useSession";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { loading, sessionUserId } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-muted-foreground">Checking session…</div>
      </div>
    );
  }
  if (!sessionUserId) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}
