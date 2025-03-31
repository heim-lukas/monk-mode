import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Routes, Route } from "react-router-dom";
import { Tasks } from "./tasks";
import { Profile } from "./profile";
import { Friends } from "./friends";
import { NotFound } from "./not-found";
import { TimeblockList } from "./timeblock-list";

function DashboardHome() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to MonkMode</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeblockList />
        </CardContent>
      </Card>
    </div>
  );
}

export function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </SidebarProvider>
  );
}
