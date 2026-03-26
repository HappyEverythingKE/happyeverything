import { supabase } from "@/lib/supabase";

export interface ScrapedProduct {
  name: string | null;
  brand: string | null;
  image: string | null;
  description: string | null;
  colour: string | null;
  size: string | null;
  category: string | null;
  shop: string | null;
  price: string | null;
}

export async function scrapeProductFromUrl(url: string): Promise<ScrapedProduct> {
  const { data, error } = await supabase.functions.invoke("scrape-product", {
    body: { type: "url", url },
  });
  if (error) throw error;
  return data as ScrapedProduct;
}

export async function scrapeProductFromScreenshot(file: File): Promise<ScrapedProduct> {
  const base64 = await fileToDataUrl(file);
  const { data, error } = await supabase.functions.invoke("scrape-product", {
    body: { type: "screenshot", image: base64 },
  });
  if (error) throw error;
  return data as ScrapedProduct;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
