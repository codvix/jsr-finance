import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAction, getClientIP } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["PENDING", "ACTIVE", "COMPLETED", "DEFAULTED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.update({
      where: { id: params.id },
      data: { status },
      include: {
        customer: true,
      },
    });

    await logAction(
      user,
      "UPDATE",
      "Loan",
      loan.id,
      `Updated loan status to ${status}`,
      getClientIP(request)
    );

    return NextResponse.json(loan);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating loan status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
