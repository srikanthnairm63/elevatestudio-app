import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PaymentsManagement = () => {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select("*, profiles(full_name)")
      .order("payment_date", { ascending: false });
    setPayments(data || []);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-success/20 text-success",
      pending: "bg-warning/20 text-warning",
      failed: "bg-destructive/20 text-destructive",
      refunded: "bg-muted"
    };
    return colors[status] || "bg-muted";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payments</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.profiles?.full_name}</TableCell>
                <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                <TableCell>{payment.payment_method || "-"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PaymentsManagement;
