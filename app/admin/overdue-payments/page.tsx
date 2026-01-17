"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatCurrency";
import { Phone, Mail } from "lucide-react";

type OverduePayment = {
  id: string;
  customerId: string;
  customerName: string;
  loanId: string;
  amount: number;
  dueDate: string;
  daysPastDue: number;
  customerPhone: string;
  customerEmail: string;
};

export default function AdminOverduePaymentsPage() {
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDays, setFilterDays] = useState("all");
  const router = useRouter();

  useEffect(() => {
    fetchOverduePayments();
  }, []);

  const fetchOverduePayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/overdue-payments");
      if (!response.ok) {
        throw new Error("Failed to fetch overdue payments");
      }
      const data = await response.json();
      setOverduePayments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch overdue payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (method: "phone" | "email", value: string) => {
    if (method === "phone") {
      window.location.href = `tel:${value}`;
    } else {
      window.location.href = `mailto:${value}`;
    }
  };

  const filteredPayments = overduePayments.filter(
    (payment) =>
      (payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.loanId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterDays === "all" || payment.daysPastDue <= parseInt(filterDays))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Overdue Payments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filter and Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by customer name or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="filterDays">Days Past Due</Label>
              <Select value={filterDays} onValueChange={setFilterDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Overdue Payments List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Past Due</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.customerName}</TableCell>
                    <TableCell>{payment.loanId}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{payment.daysPastDue}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleContact("phone", payment.customerPhone)
                          }
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleContact("email", payment.customerEmail)
                          }
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/loans/${payment.loanId}`)
                          }
                        >
                          View Loan
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
