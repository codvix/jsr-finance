"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/formatCurrency";
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
};

type Loan = {
  id: string;
  amount: number;
  interestRate: number;
  term: number;
  startDate: string;
  emiFrequency: "DAILY" | "MONTHLY";
  totalAmount: number;
  dailyPayment: number;
};

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [newAadharImage, setNewAadharImage] = useState<File | null>(null);
  const [newPanImage, setNewPanImage] = useState<File | null>(null);
  const [newBankDetailsImage, setNewBankDetailsImage] = useState<File | null>(
    null
  );
  const [newCheckbookImage, setNewCheckbookImage] = useState<File | null>(null);

  useEffect(() => {
    fetchCustomerDetails();
  }, []);

  const fetchCustomerDetails = async () => {
    try {
      const customerResponse = await fetch(`/api/customers/${params.id}`);
      const customerData = await customerResponse.json();
      setCustomer(customerData);
      setEditedCustomer(customerData);

      const loansResponse = await fetch(`/api/customers/${params.id}/loans`);
      const loansData = await loansResponse.json();
      setLoans(loansData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customer details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!editedCustomer) return;

    const formData = new FormData();
    formData.append("name", editedCustomer.name);
    formData.append("email", editedCustomer.email);
    formData.append("phone", editedCustomer.phone);
    if (newAadharImage) formData.append("aadharImage", newAadharImage);
    if (newPanImage) formData.append("panImage", newPanImage);
    if (newBankDetailsImage)
      formData.append("bankDetailsImage", newBankDetailsImage);
    if (newCheckbookImage) formData.append("checkbookImage", newCheckbookImage);

    try {
      // Optimistic update
      setCustomer(editedCustomer);

      const response = await fetch(`/api/customers/${params.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomer(updatedCustomer);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Customer information updated successfully.",
        });
      } else {
        throw new Error("Failed to update customer");
      }
    } catch (error) {
      // Revert optimistic update
      setCustomer(customer);
      toast({
        title: "Error",
        description: "Failed to update customer information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        Back to Customers
      </Button>
      <h1 className="text-3xl font-bold">Customer Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editedCustomer?.name}
                    onChange={(e) =>
                      setEditedCustomer({
                        ...editedCustomer!,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedCustomer?.email}
                    onChange={(e) =>
                      setEditedCustomer({
                        ...editedCustomer!,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editedCustomer?.phone}
                    onChange={(e) =>
                      setEditedCustomer({
                        ...editedCustomer!,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aadharImage">Aadhar Image</Label>
                  <Input
                    id="aadharImage"
                    type="file"
                    onChange={(e) => handleImageChange(e, setNewAadharImage)}
                    accept="image/*"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panImage">PAN Image</Label>
                  <Input
                    id="panImage"
                    type="file"
                    onChange={(e) => handleImageChange(e, setNewPanImage)}
                    accept="image/*"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankDetailsImage">Bank Details Image</Label>
                  <Input
                    id="bankDetailsImage"
                    type="file"
                    onChange={(e) =>
                      handleImageChange(e, setNewBankDetailsImage)
                    }
                    accept="image/*"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkbookImage">Checkbook Image</Label>
                  <Input
                    id="checkbookImage"
                    type="file"
                    onChange={(e) => handleImageChange(e, setNewCheckbookImage)}
                    accept="image/*"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Save Changes</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong> {customer.name}
                </div>
                <div>
                  <strong>Email:</strong> {customer.email}
                </div>
                <div>
                  <strong>Phone:</strong> {customer.phone}
                </div>
              </div>
              <Button className="mt-4" onClick={() => setIsEditing(true)}>
                Edit Information
              </Button>
            </>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <strong>Aadhar Image:</strong>
              {customer.aadharImageUrl && (
                <Image
                  src={customer.aadharImageUrl}
                  alt="Aadhar"
                  width={200}
                  height={200}
                />
              )}
            </div>
            <div>
              <strong>PAN Image:</strong>
              {customer.panImageUrl && (
                <Image
                  src={customer.panImageUrl}
                  alt="PAN"
                  width={200}
                  height={200}
                />
              )}
            </div>
            <div>
              <strong>Bank Details Image:</strong>
              {customer.bankDetailsImageUrl && (
                <Image
                  src={customer.bankDetailsImageUrl}
                  alt="Bank Details"
                  width={200}
                  height={200}
                />
              )}
            </div>
            <div>
              <strong>Checkbook Image:</strong>
              {customer.checkbookImageUrl && (
                <Image
                  src={customer.checkbookImageUrl}
                  alt="Checkbook"
                  width={200}
                  height={200}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {loans.map((loan) => (
                <TableRow key={loan.id}>
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
                      View Loan Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to update this customer's information?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmEdit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
