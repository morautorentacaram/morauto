import { MobileNav } from "@/components/public/mobile-nav";
import InstallPWA from "@/components/public/InstallPWA";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <MobileNav />
      <InstallPWA />
    </>
  );
}
