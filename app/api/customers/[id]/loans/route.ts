import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const loans = await prisma.loan.findMany({
    where: { customerId: params.id },
  });

  return NextResponse.json(loans);
}
