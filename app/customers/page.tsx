"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Pagination } from "@/components/ui/pagination";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadharImageUrl: string | null;
  panImageUrl: string | null;
  bankDetailsImageUrl: string | null;
  checkbookImageUrl: string | null;
  _count: {
    loans: number;
  };
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadharImage, setAadharImage] = useState<File | null>(null);
  const [panImage, setPanImage] = useState<File | null>(null);
  const [bankDetailsImage, setBankDetailsImage] = useState<File | null>(null);
  const [checkbookImage, setCheckbookImage] = useState<File | null>(null);
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
    fetchCustomers();
  }, [page, searchTerm]);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/customers?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.data) {
        setCustomers(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setHasNext(data.pagination.hasNext);
        setHasPrev(data.pagination.hasPrev);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch customers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching customers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    if (aadharImage) formData.append("aadharImage", aadharImage);
    if (panImage) formData.append("panImage", panImage);
    if (bankDetailsImage) formData.append("bankDetailsImage", bankDetailsImage);
    if (checkbookImage) formData.append("checkbookImage", checkbookImage);

    const response = await fetch("/api/customers", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      resetForm();
      setPage(1);
      fetchCustomers();
      toast({
        title: "Customer Added",
        description: "A new customer has been added successfully.",
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
    setName("");
    setEmail("");
    setPhone("");
    setAadharImage(null);
    setPanImage(null);
    setBankDetailsImage(null);
    setCheckbookImage(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/customers?page=${newPage}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add New Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadharImage">Aadhar Image</Label>
                <Input
                  id="aadharImage"
                  type="file"
                  onChange={(e) => setAadharImage(e.target.files?.[0] || null)}
                  accept="image/*"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panImage">PAN Image</Label>
                <Input
                  id="panImage"
                  type="file"
                  onChange={(e) => setPanImage(e.target.files?.[0] || null)}
                  accept="image/*"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankDetailsImage">Bank Details Image</Label>
                <Input
                  id="bankDetailsImage"
                  type="file"
                  onChange={(e) =>
                    setBankDetailsImage(e.target.files?.[0] || null)
                  }
                  accept="image/*"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkbookImage">Checkbook Image</Label>
                <Input
                  id="checkbookImage"
                  type="file"
                  onChange={(e) =>
                    setCheckbookImage(e.target.files?.[0] || null)
                  }
                  accept="image/*"
                />
              </div>
            </div>
            <Button type="submit">Add Customer</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search customers..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Aadhar</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Bank Details</TableHead>
                <TableHead>Checkbook</TableHead>
                <TableHead>Number of Loans</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    {customer.aadharImageUrl && (
                      <Image
                        src={customer.aadharImageUrl}
                        alt="Aadhar"
                        width={50}
                        height={50}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.panImageUrl && (
                      <Image
                        src={customer.panImageUrl}
                        alt="PAN"
                        width={50}
                        height={50}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.bankDetailsImageUrl && (
                      <Image
                        src={customer.bankDetailsImageUrl}
                        alt="Bank Details"
                        width={50}
                        height={50}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.checkbookImageUrl && (
                      <Image
                        src={customer.checkbookImageUrl}
                        alt="Checkbook"
                        width={50}
                        height={50}
                      />
                    )}
                  </TableCell>
                  <TableCell>{customer._count.loans}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/customers/${customer.id}`)}
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
