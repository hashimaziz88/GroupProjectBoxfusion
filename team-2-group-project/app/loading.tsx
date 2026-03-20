
// No error or success feedback required: loading shell only
import AppSpinner from "@/components/spinner/AppSpinner";

export default function Loading() {
  // User feedback: loading state
  return <AppSpinner label="Loading application..." />;
}
