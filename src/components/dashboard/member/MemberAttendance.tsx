import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const MemberAttendance = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);

  useEffect(() => {
    loadAttendance();
  }, [userId]);

  const loadAttendance = async () => {
    const { data } = await supabase.from("attendance").select("*").eq("user_id", userId).order("check_in_time", { ascending: false });
    setAttendance(data || []);
    const active = data?.find(a => !a.check_out_time);
    setActiveSession(active);
  };

  const handleCheckIn = async () => {
    try {
      const { error } = await supabase.from("attendance").insert({ user_id: userId });
      if (error) throw error;
      toast({ title: "Checked in successfully" });
      loadAttendance();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleCheckOut = async () => {
    try {
      const { error } = await supabase.from("attendance").update({ check_out_time: new Date().toISOString() }).eq("id", activeSession.id);
      if (error) throw error;
      toast({ title: "Checked out successfully" });
      loadAttendance();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Button onClick={handleCheckIn} disabled={!!activeSession}>Check In</Button>
          <Button onClick={handleCheckOut} disabled={!activeSession} variant="outline">Check Out</Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.check_in_time).toLocaleString()}</TableCell>
                <TableCell>{record.check_out_time ? new Date(record.check_out_time).toLocaleString() : "Active"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default MemberAttendance;
