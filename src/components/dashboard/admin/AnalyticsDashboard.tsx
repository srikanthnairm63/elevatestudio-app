import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    todayAttendance: 0
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadChartData();
  }, []);

  const loadStats = async () => {
    // Total members with member role
    const { count: totalMembers } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "member");

    // Active memberships
    const { count: activeMembers } = await supabase
      .from("member_memberships")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "completed")
      .gte("payment_date", startOfMonth.toISOString());

    const monthlyRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayAttendance } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .gte("check_in_time", today.toISOString());

    setStats({
      totalMembers: totalMembers || 0,
      activeMembers: activeMembers || 0,
      monthlyRevenue,
      todayAttendance: todayAttendance || 0
    });
  };

  const loadChartData = async () => {
    // Last 7 days revenue
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }

    const revenuePromises = days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const { data } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .gte("payment_date", day.toISOString())
        .lt("payment_date", nextDay.toISOString());

      const revenue = data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue
      };
    });

    const revenue = await Promise.all(revenuePromises);
    setRevenueData(revenue);

    // Last 7 days attendance
    const attendancePromises = days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const { count } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .gte("check_in_time", day.toISOString())
        .lt("check_in_time", nextDay.toISOString());

      return {
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        attendance: count || 0
      };
    });

    const attendance = await Promise.all(attendancePromises);
    setAttendanceData(attendance);
  };

  const statCards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Active Memberships",
      value: stats.activeMembers,
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-warning"
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: Activity,
      color: "text-accent"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="hsl(var(--success))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
