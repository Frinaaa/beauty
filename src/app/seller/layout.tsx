import Sidebar from "@/src/components/seller/Sidebar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#FDFBFB] overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#FDFBFB] to-[#F8F7F4]">
        {children}
      </main>
    </div>
  );
}
