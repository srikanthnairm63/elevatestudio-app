import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Users, Calendar, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Member Management",
      description: "Complete CRUD operations for gym members with profile management"
    },
    {
      icon: Calendar,
      title: "Class Scheduling",
      description: "Schedule classes, manage trainers, and track bookings seamlessly"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track revenue, active members, and attendance trends in real-time"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-primary p-6 rounded-2xl shadow-2xl">
              <Dumbbell className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            FitPro Gym Management
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete gym management solution with member tracking, class scheduling, 
            payments, and analytics - all in one powerful platform
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border"
            >
              <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Features List */}
        <div className="mt-20 bg-card rounded-2xl p-10 shadow-xl border border-border">
          <h2 className="text-3xl font-bold mb-8 text-center">Complete Feature Set</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "User authentication with role-based access (Admin/Member)",
              "Member profiles with photo uploads",
              "Trainer management and assignment",
              "Class scheduling and booking system",
              "Membership plans (Monthly, Quarterly, Yearly)",
              "Attendance tracking with check-in/check-out",
              "Payment recording and invoice management",
              "Analytics dashboard with charts and insights"
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-success/20 rounded-full p-1 mt-1">
                  <div className="bg-success rounded-full w-2 h-2" />
                </div>
                <p className="text-card-foreground">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
