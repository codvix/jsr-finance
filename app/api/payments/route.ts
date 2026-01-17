import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAction, getClientIP } from "@/lib/audit";
import {
  getPaginationParams,
  createPaginatedResponse,
} from "@/lib/pagination";

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const { page, limit, search, sortBy, sortOrder } =
      getPaginationParams(searchParams);

    const where = search
      ? {
          OR: [
            {
              loan: {
                customer: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            },
            { amount: { equals: parseFloat(search) || undefined } },
            { status: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const orderBy = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          loan: {
            include: {
              customer: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json(
      createPaginatedResponse(payments, total, page, limit)
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const payment = await prisma.payment.create({
      data: {
        loanId: body.loanId,
        amount: parseFloat(body.amount),
        date: new Date(body.date),
        status: body.status,
        method: body.method || null,
        notes: body.notes || null,
      },
      include: {
        loan: {
          include: {
            customer: true,
          },
        },
      },
    });

    await logAction(
      user,
      "CREATE",
      "Payment",
      payment.id,
      `Created payment: ${payment.amount} for loan ${payment.loanId}`,
      getClientIP(request)
    );

    return NextResponse.json(payment);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
