import SidebarWrapper from "@/components/shared/sidebar/SidebarWrapper";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <SidebarWrapper>{children}</SidebarWrapper>;
}
