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
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  membership?: {
    plan: { name: string };
    status: string;
    end_date: string;
  };
}

const MembersManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ email: "", password: "", full_name: "", phone: "", plan_id: "" });

  useEffect(() => {
    loadMembers();
    loadPlans();
  }, []);

  const loadMembers = async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "member");

    if (!roles) return;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", roles.map(r => r.user_id));

    const membersWithDetails = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: membership } = await supabase
          .from("member_memberships")
          .select("status, end_date, plan_id, membership_plans(name)")
          .eq("user_id", profile.id)
          .eq("status", "active")
          .maybeSingle();

        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);

        return {
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone || "",
          email: authUser?.user?.email || "",
          membership: membership ? {
            plan: { name: (membership as any).membership_plans?.name || "" },
            status: membership.status,
            end_date: membership.end_date
          } : undefined
        };
      })
    );

    setMembers(membersWithDetails);
  };

  const loadPlans = async () => {
    const { data } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true);
    setPlans(data || []);
  };

  const handleAddMember = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newMember.email,
        password: newMember.password,
        options: {
          data: {
            full_name: newMember.full_name,
            phone: newMember.phone
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "member"
      });

      const plan = plans.find(p => p.id === newMember.plan_id);
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.duration_months);

        await supabase.from("member_memberships").insert({
          user_id: authData.user.id,
          plan_id: plan.id,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          status: "active"
        });
      }

      toast({ title: "Success", description: "Member added successfully" });
      setIsAddDialogOpen(false);
      setNewMember({ email: "", password: "", full_name: "", phone: "", plan_id: "" });
      loadMembers();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Members</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={newMember.full_name}
                  onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Membership Plan</Label>
                <Select
                  value={newMember.plan_id}
                  onValueChange={(value) => setNewMember({ ...newMember, plan_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddMember} className="w-full">Create Member</Button>
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
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.full_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{member.membership?.plan.name || "No Plan"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    member.membership?.status === "active" ? "bg-success/20 text-success" : "bg-muted"
                  }`}>
                    {member.membership?.status || "Inactive"}
                  </span>
                </TableCell>
                <TableCell>{member.membership?.end_date || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default MembersManagement;
