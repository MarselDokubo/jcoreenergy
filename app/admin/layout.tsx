import { ClerkProvider } from "@clerk/nextjs";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
 return <ClerkProvider signInUrl="/admin/login" signUpUrl="/admin/login" afterSignOutUrl="/admin/login">{children}</ClerkProvider>;
}
