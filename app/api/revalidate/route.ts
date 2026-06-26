import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ revalidated: true });
}
