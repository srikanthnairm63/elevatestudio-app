import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    const { data } = await supabase
      .from("attendance")
      .select("*, profiles(full_name)")
      .order("check_in_time", { ascending: false })
      .limit(50);
    setAttendance(data || []);
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString();
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "In progress";
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Attendance Records</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.profiles?.full_name}</TableCell>
                <TableCell>{formatTime(record.check_in_time)}</TableCell>
                <TableCell>{formatTime(record.check_out_time)}</TableCell>
                <TableCell>{calculateDuration(record.check_in_time, record.check_out_time)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AttendanceManagement;
