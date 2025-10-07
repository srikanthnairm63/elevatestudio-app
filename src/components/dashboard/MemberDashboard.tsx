import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { Calendar, CreditCard, UserCheck, Dumbbell, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import MemberProfile from "./member/MemberProfile";
import MemberClasses from "./member/MemberClasses";
import MemberAttendance from "./member/MemberAttendance";
import MemberPayments from "./member/MemberPayments";

interface MemberDashboardProps {
  user: User;
}

type Tab = "profile" | "classes" | "attendance" | "payments";

const MemberDashboard = ({ user }: MemberDashboardProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const menuItems = [
    { id: "profile" as Tab, label: "My Profile", icon: UserIcon },
    { id: "classes" as Tab, label: "Classes", icon: Dumbbell },
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
                <Dumbbell className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-sidebar-foreground">FitPro Gym</h2>
                <p className="text-xs text-sidebar-foreground/60">Member Portal</p>
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

          {activeTab === "profile" && <MemberProfile userId={user.id} />}
          {activeTab === "classes" && <MemberClasses userId={user.id} />}
          {activeTab === "attendance" && <MemberAttendance userId={user.id} />}
          {activeTab === "payments" && <MemberPayments userId={user.id} />}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MemberDashboard;
