import { supabase } from "@/lib/supabase";

export interface ScrapedProduct {
  name: string | null;
  brand: string | null;
  size: string | null;
  colour: string | null;
  shop: string | null;
  category: string | null;
  description: string | null;
  price: string | null;
  notes: string | null;
  imageUrl: string | null;
}

export interface ScrapeProductResult {
  success: boolean;
  product: ScrapedProduct | null;
  error: string | null;
}

type RawScrapedProduct = Partial<ScrapedProduct> & {
  image?: string | null;
};

type WrappedScrapeResponse = {
  success: boolean;
  product: RawScrapedProduct | null;
  error: string | null;
};

export async function scrapeProductFromUrl(
  url: string,
): Promise<ScrapeProductResult> {
  const { data, error } = await supabase.functions.invoke("scrape-product", {
    body: { type: "url", url },
  });

  if (error) {
    return {
      success: false,
      product: null,
      error: error.message ?? "Failed to scrape product",
    };
  }

  return normalizeScrapeResponse(data);
}

export async function scrapeProductFromScreenshot(
  file: File,
): Promise<ScrapeProductResult> {
  const image = await fileToDataUrl(file);

  const { data, error } = await supabase.functions.invoke("scrape-product", {
    body: { type: "screenshot", image },
  });

  if (error) {
    return {
      success: false,
      product: null,
      error: error.message ?? "Failed to scrape product from screenshot",
    };
  }

  return normalizeScrapeResponse(data);
}

function normalizeScrapeResponse(data: unknown): ScrapeProductResult {
  if (isWrappedScrapeResponse(data)) {
    return {
      success: data.success,
      product: data.product ? normalizeProduct(data.product) : null,
      error: data.error ?? null,
    };
  }

  if (data && typeof data === "object") {
    return {
      success: true,
      product: normalizeProduct(data as RawScrapedProduct),
      error: null,
    };
  }

  return {
    success: false,
    product: null,
    error: "Invalid scrape response",
  };
}

function normalizeProduct(input: RawScrapedProduct): ScrapedProduct {
  const description = toNullableString(input.description);
  const price = toNullableString(input.price);
  const existingNotes = toNullableString(input.notes);

  return {
    name: toNullableString(input.name),
    brand: toNullableString(input.brand),
    size: toNullableString(input.size),
    colour: toNullableString(input.colour),
    shop: toNullableString(input.shop),
    category: toNullableString(input.category),
    description,
    price,
    notes: existingNotes ?? buildNotes(description, price),
    imageUrl: toNullableString(input.imageUrl) ?? toNullableString(input.image),
  };
}

function buildNotes(
  description: string | null,
  price: string | null,
): string | null {
  const parts = [description, price ? `Price: ${price}` : null].filter(
    (value): value is string => Boolean(value && value.trim()),
  );

  return parts.length > 0 ? parts.join("\n\n") : null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isWrappedScrapeResponse(
  value: unknown,
): value is WrappedScrapeResponse {
  return (
    !!value &&
    typeof value === "object" &&
    "success" in value &&
    "product" in value
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));

    reader.readAsDataURL(file);
  });
}
