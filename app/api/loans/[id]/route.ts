import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const loan = await prisma.loan.findUnique({
    where: { id: id },
    include: {
      customer: true,
      payments: {
        orderBy: {
          createdAt: "desc", // ✅ Sort payments in descending order
        },
      },
    },
  });

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  return NextResponse.json(loan);
}
