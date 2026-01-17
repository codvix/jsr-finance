import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const currentYear = new Date().getFullYear();
  const monthlyData = await prisma.payment.groupBy({
    by: ["date"],
    _sum: {
      amount: true,
    },
    where: {
      date: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1),
      },
    },
  });

  return NextResponse.json(monthlyData);
}
