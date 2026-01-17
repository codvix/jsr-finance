import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const loanStats = await prisma.loan.aggregate({
      _sum: { amount: true, totalAmount: true },
      _count: { id: true },
    });

    const paymentStats = await prisma.payment.aggregate({
      _sum: { amount: true },
    });

    const totalDisbursed = loanStats._sum.amount || 0;
    const totalRecoveredWithInterest = paymentStats._sum.amount || 0;

    const totalRecoveredWithoutInterest = Math.min(
      totalRecoveredWithInterest,
      totalDisbursed
    );

    const loans = await prisma.loan.findMany({
      select: { id: true, totalAmount: true, amount: true },
    });
    const paymentsByLoan = await prisma.payment.groupBy({
      by: ["loanId"],
      _sum: { amount: true },
    });
    const paymentsMap = new Map<string, number>(
      paymentsByLoan.map((p) => [p.loanId, p._sum.amount || 0])
    );
    const activeLoans = loans.filter((loan) => {
      const paid = paymentsMap.get(loan.id) || 0;
      const expected = (loan.totalAmount ?? loan.amount) || 0;
      return paid < expected;
    }).length;

    const totalCustomers = await prisma.customer.count();

    return NextResponse.json({
      totalDisbursed,
      totalRecoveredWithoutInterest,
      totalRecoveredWithInterest,
      activeLoans,
      totalCustomers,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database Error", code: (error as any).code },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
