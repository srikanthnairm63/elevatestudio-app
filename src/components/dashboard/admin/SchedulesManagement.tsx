import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const SchedulesManagement = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    class_id: "",
    scheduled_date: "",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    loadSchedules();
    loadClasses();
  }, []);

  const loadSchedules = async () => {
    const { data } = await supabase
      .from("class_schedules")
      .select("*, classes(name)")
      .order("scheduled_date", { ascending: false })
      .order("start_time");
    setSchedules(data || []);
  };

  const loadClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("id, name")
      .eq("is_active", true);
    setClasses(data || []);
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from("class_schedules")
        .insert(formData);
      if (error) throw error;
      toast({ title: "Schedule created successfully" });
      setIsDialogOpen(false);
      setFormData({ class_id: "", scheduled_date: "", start_time: "", end_time: "" });
      loadSchedules();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("class_schedules")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Schedule deleted successfully" });
      loadSchedules();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Class Schedules</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Class</Label>
                <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">Create Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.classes?.name}</TableCell>
                <TableCell>{new Date(schedule.scheduled_date).toLocaleDateString()}</TableCell>
                <TableCell>{schedule.start_time}</TableCell>
                <TableCell>{schedule.end_time}</TableCell>
                <TableCell>{schedule.current_bookings}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(schedule.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SchedulesManagement;
