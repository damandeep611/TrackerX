import { getSandboxes } from "@/actions/sandboxActions";
import SandboxPageContent from "@/components/dashboard/sandbox/sandbox-page-content";

export default async function SandboxPage() {
  const sandboxes = await getSandboxes();
  
  return (
    <div className="p-6">
      <SandboxPageContent initialSandboxes={sandboxes} />
    </div>
  );
}
