import { Nav } from "@/components/Nav";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Nav />
      <main className="flex-1 px-4 pb-32 pt-8 sm:px-8 lg:px-12">{children}</main>
    </div>
  );
}
