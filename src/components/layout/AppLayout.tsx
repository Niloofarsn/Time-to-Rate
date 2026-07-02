import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";

export function AppLayout() {
  return (
    <>
      <TopNav />
      <main>
        <Outlet />
      </main>
    </>
  );
}
