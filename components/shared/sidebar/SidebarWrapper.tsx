import { ReactNode } from "react";
import DesktopNav from "./nav/DesktopNav";
import MobileNav from "./nav/MobileNav";

export default function SidebarWrapper({ children }: { children: ReactNode }) {
  return (
    <div className='h-full w-full p-4 flex flex-col lg:flex-row gap-4'>
      <MobileNav />
      <DesktopNav />
      <main className='h-[calc(100%-80px)] lg:h-full w-full flex gap-4'>{children}</main>
    </div>
  );
}
