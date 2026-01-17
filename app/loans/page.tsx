"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "@/hooks/use-toast";

type Loan = {
  id: string;
  customerId: string;
  amount: number;
  interestRate: number;
  term: number;
  startDate: string;
  emiFrequency: string;
  totalAmount: number;
  dailyPayment: number;
  loanAgreementUrl: string | null;
  supportingImages: { id: string; url: string }[];
  customer: {
    name: string;
  };
};

type Customer = {
  id: string;
  name: string;
};

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [term, setTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [emiFrequency, setEmiFrequency] = useState<"DAILY" | "MONTHLY">(
    "DAILY"
  );
  const [loanAgreement, setLoanAgreement] = useState<File | null>(null);
  const [supportingImages, setSupportingImages] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) {
      setPage(parseInt(pageParam, 10));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchLoans();
    fetchCustomers();
  }, [page, searchTerm]);

  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/loans?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.data) {
        setLoans(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setHasNext(data.pagination.hasNext);
        setHasPrev(data.pagination.hasPrev);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch loans",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching loans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm]);

  const fetchCustomers = async () => {
    const response = await fetch("/api/customers?limit=1000");
    const data = await response.json();
    if (data.data) {
      setCustomers(data.data);
    } else {
      setCustomers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("customerId", customerId);
    formData.append("amount", amount);
    formData.append("interestRate", interestRate);
    formData.append("term", term);
    formData.append("startDate", startDate);
    formData.append("emiFrequency", emiFrequency);

    if (loanAgreement) {
      formData.append("loanAgreement", loanAgreement);
    }

    supportingImages.forEach((image, index) => {
      formData.append(`supportingImage`, image);
    });

    const response = await fetch("/api/loans", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      resetForm();
      setPage(1);
      fetchLoans();
      toast({
        title: "Loan Added",
        description: "A new loan has been added successfully.",
      });
    } else {
      toast({
        title: "Error",
        description:
          "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCustomerId("");
    setAmount("");
    setInterestRate("");
    setTerm("");
    setStartDate("");
    setEmiFrequency("DAILY");
    setLoanAgreement(null);
    setSupportingImages([]);
  };

  const handleLoanAgreementChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setLoanAgreement(e.target.files[0]);
    }
  };

  const handleSupportingImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      setSupportingImages(Array.from(e.target.files));
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/loans?page=${newPage}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLoans();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Loans</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add New Loan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">
                  Interest Rate (% per month)
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term (months)</Label>
                <Input
                  id="term"
                  type="number"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emiFrequency">EMI Frequency</Label>
                <Select
                  value={emiFrequency}
                  onValueChange={(value: "DAILY" | "MONTHLY") =>
                    setEmiFrequency(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanAgreement">Loan Agreement (PDF)</Label>
                <Input
                  id="loanAgreement"
                  type="file"
                  accept=".pdf"
                  onChange={handleLoanAgreementChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportingImages">Supporting Images</Label>
                <Input
                  id="supportingImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSupportingImagesChange}
                />
              </div>
            </div>
            <Button type="submit">Add Loan</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Loan List</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </div>
          </form>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Principal Amount</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>EMI Frequency</TableHead>
                <TableHead>Daily Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.customer.name}</TableCell>
                  <TableCell>{formatCurrency(loan.amount)}</TableCell>
                  <TableCell>{formatCurrency(loan.totalAmount)}</TableCell>
                  <TableCell>{loan.interestRate}% per month</TableCell>
                  <TableCell>{loan.term} months</TableCell>
                  <TableCell>
                    {new Date(loan.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{loan.emiFrequency}</TableCell>
                  <TableCell>{formatCurrency(loan.dailyPayment)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/loans/${loan.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {total > 0 && (
            <Pagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrev={hasPrev}
              onPageChange={handlePageChange}
            />
          )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
