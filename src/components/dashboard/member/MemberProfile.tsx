import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MemberProfile = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);

  useEffect(() => {
    loadProfile();
    loadMembership();
  }, [userId]);

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
  };

  const loadMembership = async () => {
    const { data } = await supabase
      .from("member_memberships")
      .select("*, membership_plans(*)")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    setMembership(data);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{profile?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{profile?.phone || "Not provided"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {membership ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">{membership.membership_plans?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-success/20 text-success">{membership.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expires</p>
                <p className="font-medium">{new Date(membership.end_date).toLocaleDateString()}</p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No active membership</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberProfile;
