import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const ClassesManagement = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: "60",
    max_capacity: "20",
    trainer_id: ""
  });

  useEffect(() => {
    loadClasses();
    loadTrainers();
  }, []);

  const loadClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("*, trainers(name)")
      .eq("is_active", true)
      .order("name");
    setClasses(data || []);
  };

  const loadTrainers = async () => {
    const { data } = await supabase
      .from("trainers")
      .select("id, name")
      .eq("is_active", true);
    setTrainers(data || []);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes),
        max_capacity: parseInt(formData.max_capacity),
        trainer_id: formData.trainer_id || null
      };

      if (editingClass) {
        const { error } = await supabase
          .from("classes")
          .update(payload)
          .eq("id", editingClass.id);
        if (error) throw error;
        toast({ title: "Class updated successfully" });
      } else {
        const { error } = await supabase
          .from("classes")
          .insert(payload);
        if (error) throw error;
        toast({ title: "Class added successfully" });
      }
      setIsDialogOpen(false);
      setEditingClass(null);
      resetForm();
      loadClasses();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration_minutes: "60",
      max_capacity: "20",
      trainer_id: ""
    });
  };

  const handleEdit = (cls: any) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      description: cls.description || "",
      duration_minutes: cls.duration_minutes.toString(),
      max_capacity: cls.max_capacity.toString(),
      trainer_id: cls.trainer_id || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("classes")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Class deleted successfully" });
      loadClasses();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Classes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingClass(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Class Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} />
                </div>
                <div>
                  <Label>Max Capacity</Label>
                  <Input type="number" value={formData.max_capacity} onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Trainer</Label>
                <Select value={formData.trainer_id} onValueChange={(value) => setFormData({ ...formData, trainer_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingClass ? "Update" : "Create"} Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell>{cls.name}</TableCell>
                <TableCell>{cls.duration_minutes} min</TableCell>
                <TableCell>{cls.max_capacity}</TableCell>
                <TableCell>{cls.trainers?.name || "Unassigned"}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(cls)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(cls.id)}>
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

export default ClassesManagement;
