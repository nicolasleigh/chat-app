"use client";

import LoadingLogo from "@/components/shared/LoadingLogo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignInButton, useAuth } from "@clerk/nextjs";
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// https://github.com/get-convex/convex-demos/blob/main/nextjs-pages-router/pages/_app.tsx
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Authenticated>
          <TooltipProvider>{children}</TooltipProvider>
        </Authenticated>
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
        <AuthLoading>
          <LoadingLogo />
        </AuthLoading>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
