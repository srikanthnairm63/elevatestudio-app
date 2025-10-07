import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const TrainersManagement = () => {
  const { toast } = useToast();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", specialization: "", bio: "" });

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    const { data } = await supabase
      .from("trainers")
      .select("*")
      .eq("is_active", true)
      .order("name");
    setTrainers(data || []);
  };

  const handleSubmit = async () => {
    try {
      if (editingTrainer) {
        const { error } = await supabase
          .from("trainers")
          .update(formData)
          .eq("id", editingTrainer.id);
        if (error) throw error;
        toast({ title: "Trainer updated successfully" });
      } else {
        const { error } = await supabase
          .from("trainers")
          .insert(formData);
        if (error) throw error;
        toast({ title: "Trainer added successfully" });
      }
      setIsDialogOpen(false);
      setEditingTrainer(null);
      setFormData({ name: "", email: "", phone: "", specialization: "", bio: "" });
      loadTrainers();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEdit = (trainer: any) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone || "",
      specialization: trainer.specialization || "",
      bio: trainer.bio || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("trainers")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Trainer deleted successfully" });
      loadTrainers();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trainers</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTrainer(null); setFormData({ name: "", email: "", phone: "", specialization: "", bio: "" }); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trainer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTrainer ? "Edit Trainer" : "Add New Trainer"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingTrainer ? "Update" : "Create"} Trainer
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
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((trainer) => (
              <TableRow key={trainer.id}>
                <TableCell>{trainer.name}</TableCell>
                <TableCell>{trainer.email}</TableCell>
                <TableCell>{trainer.phone}</TableCell>
                <TableCell>{trainer.specialization}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(trainer)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(trainer.id)}>
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

export default TrainersManagement;
