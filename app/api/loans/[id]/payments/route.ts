import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const payment = await prisma.payment.create({
    data: {
      loanId: params.id,
      amount: body.amount,
      date: new Date(body.date),
      method: body.method,
      status: "PAID",
    },
  });

  return NextResponse.json(payment);
}
