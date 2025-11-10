import { Navigate } from "react-router-dom";

export default function Index() {
  // Always let the gate decide where to go:
  return <Navigate to="/" replace />;
}
