import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const MemberClasses = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    loadSchedules();
    loadBookings();
  }, [userId]);

  const loadSchedules = async () => {
    const { data } = await supabase.from("class_schedules").select("*, classes(*)").gte("scheduled_date", new Date().toISOString().split("T")[0]).order("scheduled_date").order("start_time");
    setSchedules(data || []);
  };

  const loadBookings = async () => {
    const { data } = await supabase.from("class_bookings").select("schedule_id").eq("user_id", userId).eq("status", "confirmed");
    setBookings(data || []);
  };

  const handleBook = async (scheduleId: string) => {
    try {
      const { error } = await supabase.from("class_bookings").insert({ user_id: userId, schedule_id: scheduleId });
      if (error) throw error;
      toast({ title: "Class booked successfully" });
      loadBookings();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {schedules.map((schedule) => {
        const isBooked = bookings.some(b => b.schedule_id === schedule.id);
        return (
          <Card key={schedule.id} className="p-6">
            <h3 className="font-bold text-lg mb-2">{schedule.classes?.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{schedule.classes?.description}</p>
            <div className="space-y-2 text-sm mb-4">
              <p><span className="font-medium">Date:</span> {new Date(schedule.scheduled_date).toLocaleDateString()}</p>
              <p><span className="font-medium">Time:</span> {schedule.start_time} - {schedule.end_time}</p>
            </div>
            <Button onClick={() => handleBook(schedule.id)} disabled={isBooked} className="w-full">
              {isBooked ? "Booked" : "Book Class"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
};

export default MemberClasses;
