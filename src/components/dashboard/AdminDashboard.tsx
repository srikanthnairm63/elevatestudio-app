import { User } from "@supabase/supabase-js";
import { useState } from "react";
import {
  BarChart3,
  Users,
  Calendar,
  CreditCard,
  UserCheck,
  Dumbbell,
  LogOut,
  LayoutDashboard,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import AnalyticsDashboard from "./admin/AnalyticsDashboard";
import MembersManagement from "./admin/MembersManagement";
import TrainersManagement from "./admin/TrainersManagement";
import ClassesManagement from "./admin/ClassesManagement";
import SchedulesManagement from "./admin/SchedulesManagement";
import PaymentsManagement from "./admin/PaymentsManagement";
import AttendanceManagement from "./admin/AttendanceManagement";

interface AdminDashboardProps {
  user: User;
}

type Tab = "analytics" | "members" | "trainers" | "classes" | "schedules" | "payments" | "attendance";

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("analytics");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const menuItems = [
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
    { id: "members" as Tab, label: "Members", icon: Users },
    { id: "trainers" as Tab, label: "Trainers", icon: GraduationCap },
    { id: "classes" as Tab, label: "Classes", icon: Dumbbell },
    { id: "schedules" as Tab, label: "Schedules", icon: Calendar },
    { id: "attendance" as Tab, label: "Attendance", icon: UserCheck },
    { id: "payments" as Tab, label: "Payments", icon: CreditCard },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-sidebar-foreground">FitPro Admin</h2>
                <p className="text-xs text-sidebar-foreground/60">Dashboard</p>
              </div>
            </div>
          </div>
          
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <div className="p-4 border-t border-sidebar-border mt-auto">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </Sidebar>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <SidebarTrigger />
            <h1 className="text-3xl font-bold mt-4">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>

          {activeTab === "analytics" && <AnalyticsDashboard />}
          {activeTab === "members" && <MembersManagement />}
          {activeTab === "trainers" && <TrainersManagement />}
          {activeTab === "classes" && <ClassesManagement />}
          {activeTab === "schedules" && <SchedulesManagement />}
          {activeTab === "payments" && <PaymentsManagement />}
          {activeTab === "attendance" && <AttendanceManagement />}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
