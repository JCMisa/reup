import PostAuthRedirect from "@/components/custom/PostAuthRedirect";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PostAuthRedirect />
      {children}
    </>
  );
}
