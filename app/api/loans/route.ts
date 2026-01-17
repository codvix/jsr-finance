//@ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
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
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
            { amount: { equals: parseFloat(search) || undefined } },
            { status: { equals: search.toUpperCase() } },
          ],
        }
      : {};

    const orderBy = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        include: {
          customer: true,
          supportingImages: true,
          _count: {
            select: { payments: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.loan.count({ where }),
    ]);

    return NextResponse.json(
      createPaginatedResponse(loans, total, page, limit)
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching loans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const customerId = formData.get("customerId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const interestRate = parseFloat(formData.get("interestRate") as string);
    const term = parseInt(formData.get("term") as string);
    const startDate = new Date(formData.get("startDate") as string);
    const emiFrequency = formData.get("emiFrequency") as string;
    const loanAgreement = formData.get("loanAgreement") as File | null;
    const supportingImages = formData.getAll("supportingImage") as File[];

    const interestRateDecimal = interestRate / 100; // Convert percentage to decimal
    const totalInterest = amount * (interestRateDecimal * term);
    const totalAmount = amount + totalInterest;
    const dailyPayment = Math.ceil((totalAmount / (term * 30)) * 100) / 100; // Round up to 2 decimal places

    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + term);

    const uploadDir = join(process.cwd(), "public", "uploads", "loans");

    const uploadFile = async (file: File, prefix: string) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${prefix}-${Date.now()}-${file.name}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      return `/uploads/loans/${fileName}`;
    };

    let loanAgreementUrl = null;
    if (loanAgreement) {
      loanAgreementUrl = await uploadFile(loanAgreement, "loan-agreement");
    }

    const supportingImageUrls = await Promise.all(
      supportingImages.map((image) => uploadFile(image, "supporting-image"))
    );

    const loan = await prisma.loan.create({
      data: {
        customerId,
        amount,
        interestRate,
        term,
        startDate,
        endDate,
        emiFrequency,
        totalAmount,
        dailyPayment,
        status: "PENDING",
        loanAgreementUrl,
        supportingImages: {
          create: supportingImageUrls.map((url) => ({ url })),
        },
      },
      include: {
        customer: true,
        supportingImages: true,
      },
    });

    await logAction(
      user,
      "CREATE",
      "Loan",
      loan.id,
      `Created loan: ${loan.amount} for customer ${loan.customer.name}`,
      getClientIP(request)
    );

    return NextResponse.json(loan);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating loan:", error);
    return NextResponse.json(
      { error: "Failed to create loan" },
      { status: 500 }
    );
  }
}
