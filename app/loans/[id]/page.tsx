"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "@/hooks/use-toast";

type Loan = {
  id: string;
  customerId: string;
  amount: number;
  interestRate: number;
  term: number;
  startDate: string;
  emiFrequency: "DAILY" | "MONTHLY";
  totalAmount: number;
  dailyPayment: number;
  customer: {
    name: string;
  };
  payments: Payment[];
};

type Payment = {
  id: string;
  amount: number;
  date: string;
  method: "CASH" | "ONLINE";
  status: string;
};

// Utility function to format date in DD/MM/YYYY
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

export default function LoanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "ONLINE">("CASH");

  useEffect(() => {
    fetchLoanDetails();
  }, []);

  const fetchLoanDetails = async () => {
    try {
      const response = await fetch(`/api/loans/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch loan details");
      }
      const data = await response.json();
      setLoan(data);
      setPaymentAmount(data.dailyPayment.toFixed(2));
      setPaymentDate(new Date().toISOString().split("T")[0]); // Set default payment date to today
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch loan details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/loans/${params.id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          date: paymentDate,
          method: paymentMethod,
          status: "PAID",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit payment");
      }
      setPaymentAmount(loan?.dailyPayment.toFixed(2) || "");
      setPaymentDate(new Date().toISOString().split("T")[0]); // Reset to today's date
      setPaymentMethod("CASH");
      fetchLoanDetails();
      toast({
        title: "Payment Added",
        description: "The payment has been recorded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!loan) {
    return <div>Loading...</div>;
  }

  const totalPaid = loan.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const remainingAmount = loan.totalAmount - totalPaid;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        Back to Loans
      </Button>
      <h1 className="text-3xl font-bold">Loan Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Loan Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer Name</Label>
              <div>{loan.customer.name}</div>
            </div>
            <div>
              <Label>Principal Amount</Label>
              <div>{formatCurrency(loan.amount)}</div>
            </div>
            <div>
              <Label>Interest Rate</Label>
              <div>{loan.interestRate}% per month</div>
            </div>
            <div>
              <Label>Term</Label>
              <div>
                {loan.term} months ({loan.term * 30} days)
              </div>
            </div>
            <div>
              <Label>Start Date</Label>
              <div>{formatDate(loan.startDate)}</div>
            </div>
            <div>
              <Label>EMI Frequency</Label>
              <div>{loan.emiFrequency}</div>
            </div>
            <div>
              <Label>Total Loan Amount (Principal + Interest)</Label>
              <div>{formatCurrency(loan.totalAmount)}</div>
            </div>
            <div>
              <Label>Daily Payment Amount</Label>
              <div>{formatCurrency(loan.dailyPayment)}</div>
            </div>
            <div>
              <Label>Total Paid</Label>
              <div>{formatCurrency(totalPaid)}</div>
            </div>
            <div>
              <Label>Remaining Amount</Label>
              <div>{formatCurrency(remainingAmount)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Make a Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: "CASH" | "ONLINE") =>
                    setPaymentMethod(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit">Submit Payment</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment History ({loan.payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loan.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
