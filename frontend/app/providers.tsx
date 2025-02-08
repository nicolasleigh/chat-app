"use client";

import LoadingLogo from "@/frontend/components/shared/LoadingLogo";
import { Button } from "@/frontend/components/ui/button";
import { Toaster } from "@/frontend/components/ui/sonner";
import { ThemeProvider } from "@/frontend/components/ui/theme/theme-provider";
import { TooltipProvider } from "@/frontend/components/ui/tooltip";
import { ClerkProvider, SignInButton, useAuth } from "@clerk/nextjs";
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// https://github.com/get-convex/convex-demos/blob/main/nextjs-pages-router/pages/_app.tsx
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <Authenticated>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster richColors />
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode='modal'>
              <Button className='block mx-auto mt-60' variant='outline'>
                Click to sign in
              </Button>
            </SignInButton>
          </Unauthenticated>
          <AuthLoading>
            <LoadingLogo />
          </AuthLoading>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ThemeProvider>
  );
}
