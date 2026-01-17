import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overduePayments = await prisma.loan.findMany({
    where: {
      OR: [
        {
          emiFrequency: "DAILY",
          payments: {
            none: {
              date: {
                gte: today,
              },
            },
          },
        },
        {
          emiFrequency: "MONTHLY",
          payments: {
            none: {
              date: {
                gte: new Date(today.getFullYear(), today.getMonth(), 1),
              },
            },
          },
        },
      ],
    },
    include: {
      customer: true,
      payments: {
        orderBy: {
          date: "desc",
        },
        take: 1,
      },
    },
  });

  const formattedOverduePayments = overduePayments.map((loan) => {
    const lastPaymentDate = loan.payments[0]?.date || loan.startDate;
    const daysPastDue = Math.floor(
      (today.getTime() - new Date(lastPaymentDate).getTime()) /
        (1000 * 3600 * 24)
    );

    return {
      id: `${loan.id}-${lastPaymentDate.toISOString()}`,
      customerId: loan.customerId,
      customerName: loan.customer.name,
      loanId: loan.id,
      amount: loan.dailyPayment,
      dueDate: lastPaymentDate.toISOString(),
      daysPastDue: daysPastDue,
      customerPhone: loan.customer.phone,
      customerEmail: loan.customer.email,
    };
  });

  return NextResponse.json(formattedOverduePayments);
}
