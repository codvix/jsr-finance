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
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const orderBy = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { loans: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json(
      createPaginatedResponse(customers, total, page, limit)
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching customers:", error);
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
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const aadharImage = formData.get("aadharImage") as File | null;
    const panImage = formData.get("panImage") as File | null;
    const bankDetailsImage = formData.get("bankDetailsImage") as File | null;
    const checkbookImage = formData.get("checkbookImage") as File | null;

    const uploadDir = join(process.cwd(), "public", "uploads");

    const uploadImage = async (file: File | null, prefix: string) => {
      if (!file) return null;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${prefix}-${Date.now()}-${file.name}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      return `/uploads/${fileName}`;
    };

    const aadharImageUrl = await uploadImage(aadharImage, "aadhar");
    const panImageUrl = await uploadImage(panImage, "pan");
    const bankDetailsImageUrl = await uploadImage(
      bankDetailsImage,
      "bank-details"
    );
    const checkbookImageUrl = await uploadImage(checkbookImage, "checkbook");

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        aadharImageUrl,
        panImageUrl,
        bankDetailsImageUrl,
        checkbookImageUrl,
      },
    });

    await logAction(
      user,
      "CREATE",
      "Customer",
      customer.id,
      `Created customer: ${customer.name}`,
      getClientIP(request)
    );

    return NextResponse.json(customer);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
