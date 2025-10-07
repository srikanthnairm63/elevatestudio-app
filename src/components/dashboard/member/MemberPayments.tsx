import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const MemberPayments = ({ userId }: { userId: string }) => {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    loadPayments();
  }, [userId]);

  const loadPayments = async () => {
    const { data } = await supabase.from("payments").select("*").eq("user_id", userId).order("payment_date", { ascending: false });
    setPayments(data || []);
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={payment.status === "completed" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>
                  {payment.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default MemberPayments;
