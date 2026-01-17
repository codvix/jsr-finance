import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
  });

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        ...(aadharImageUrl && { aadharImageUrl }),
        ...(panImageUrl && { panImageUrl }),
        ...(bankDetailsImageUrl && { bankDetailsImageUrl }),
        ...(checkbookImageUrl && { checkbookImageUrl }),
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}
