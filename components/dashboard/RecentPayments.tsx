import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/utils/formatCurrency";

export async function RecentPayments() {
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: {
      date: "desc",
    },
    include: {
      loan: {
        include: {
          customer: true,
        },
      },
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentPayments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">
              {payment.loan.customer.name}
            </TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell>{payment.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
