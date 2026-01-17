// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";


export async function GET() {
  try {
    // Use Prisma's aggregations for better performance
    const loanStats = await prisma.loan.aggregate({
      _sum: {
        amount: true,
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const paymentStats = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    });

    const totalDisbursed = loanStats._sum.amount || 0;
    const totalRecoveredWithInterest = paymentStats._sum.amount || 0;

    // Calculate recovered without interest (principal only)
    const totalRecoveredWithoutInterest = Math.min(
      totalRecoveredWithInterest,
      totalDisbursed
    );

    // Count active loans more accurately
    const activeLoans = await prisma.loan.count({
      where: {
        OR: [
          { payments: { none: {} } }, // Loans with no payments
          {
            payments: {
              some: {},
            },
            totalAmount: {
              gt: prisma.payment.aggregate({
                where: {
                  loanId: prisma.loan.fields.id,
                },
                _sum: {
                  amount: true,
                },
              }).amount,
            },
          },
        ],
      },
    });

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
        { error: "Database Error", code: error.code },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
