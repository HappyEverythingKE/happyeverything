import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Types ────────────────────────────────────────────────────────────
interface ScrapedProduct {
  name: string | null;
  shop: string | null;
  size: string | null;
  colour: string | null;
  notes: string | null;
  imageUrl: string | null; // external URL — frontend will download & upload to Cloudflare
}

// ─── Step 1: Fetch page ───────────────────────────────────────────────
async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL (${res.status}): ${url}`);
  }

  return await res.text();
}

// ─── Step 2: Extract meta / OG / JSON-LD (cheap wins) ────────────────
function extractMeta(html: string, url: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) return {};

  const meta: Record<string, string | null> = {};

  // OG tags
  const ogMap: Record<string, string> = {
    "og:title": "name",
    "og:image": "imageUrl",
    "og:description": "notes",
    "product:brand": "brand",
    "product:color": "colour",
  };

  for (const [prop, key] of Object.entries(ogMap)) {
    const el =
      doc.querySelector(`meta[property="${prop}"]`) ??
      doc.querySelector(`meta[name="${prop}"]`);
    if (el) meta[key] = el.getAttribute("content");
  }

  // Fallback title
  if (!meta.name) {
    const titleEl = doc.querySelector("title");
    if (titleEl) meta.name = titleEl.textContent?.trim() ?? null;
  }

  // JSON-LD structured data
  const ldScripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const script of ldScripts) {
    try {
      const ld = JSON.parse(script.textContent ?? "");
      const items = Array.isArray(ld) ? ld : [ld];
      for (const item of items) {
        if (
          item["@type"] === "Product" ||
          item["@type"]?.includes?.("Product")
        ) {
          if (!meta.name && item.name) meta.name = item.name;
          if (!meta.brand && item.brand?.name) meta.brand = item.brand.name;
          if (!meta.notes && item.description) meta.notes = item.description;
          if (!meta.imageUrl && item.image) {
            meta.imageUrl = Array.isArray(item.image)
              ? item.image[0]
              : typeof item.image === "string"
                ? item.image
                : item.image?.url;
          }
          // Extract colour from variants if available
          if (!meta.colour && item.color) meta.colour = item.color;
          // Extract size
          if (!meta.size && item.size) meta.size = item.size;
        }
      }
    } catch {
      // skip malformed JSON-LD
    }
  }

  // Store the URL as the shop field
  meta.shop = url;

  // Make relative image URLs absolute
  if (meta.imageUrl && !meta.imageUrl.startsWith("http")) {
    try {
      meta.imageUrl = new URL(meta.imageUrl, url).href;
    } catch {
      // leave as-is
    }
  }

  return meta;
}

// ─── Step 3: Clean HTML for AI ────────────────────────────────────────
function cleanHtml(html: string): string {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length > 8000) {
    cleaned = cleaned.substring(0, 8000);
  }

  return cleaned;
}

// ─── Step 4: OpenAI extraction (structured output via tool calling) ───
const PRODUCT_SCHEMA = {
  name: "extract_product",
  description:
    "Extract product information from the provided content. These fields map to a wishlist/gift list item.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description:
          "Product name/title, max 150 chars. Keep it concise e.g. 'Nike Air Max 90'",
      },
      size: {
        type: "string",
        description:
          "Product size if applicable, max 50 chars. e.g. 'UK 9', 'Large', '250ml'",
      },
      colour: {
        type: "string",
        description:
          "Product colour if visible/stated, max 50 chars. e.g. 'Dark green', 'Rose gold'",
      },
      notes: {
        type: "string",
        description:
          "Brief useful notes about the product, max 250 chars. Include price if found. e.g. 'KES 2,500 — Available on Jumia. Comes in pack of 3.'",
      },
      imageUrl: {
        type: "string",
        description: "Main product image URL (full absolute URL)",
      },
    },
    required: ["name", "size", "colour", "notes", "imageUrl"],
    additionalProperties: false,
  },
};

async function extractWithAI(
  content: string,
  mode: "html" | "image",
  apiKey: string,
  metaHints?: Record<string, string | null>
): Promise<ScrapedProduct> {
  const systemPrompt = `You are a product data extraction assistant for a gift/wishlist app.
Extract product information accurately. Map the data to these fields:
- name: product title (max 150 chars, keep concise)
- size: product size if applicable (max 50 chars)
- colour: product colour (max 50 chars)
- notes: helpful details like price, where to buy, pack size (max 250 chars)
- imageUrl: main product image URL

If a field is not present, return null. Do not guess or fabricate.
For the notes field, include any price information you find as it's useful context.`;

  const messages: any[] = [{ role: "system", content: systemPrompt }];

  if (mode === "html") {
    let userContent =
      "Extract product information from this webpage content.\n\n";
    if (metaHints && Object.keys(metaHints).length > 0) {
      userContent +=
        "Pre-extracted metadata (verify against content):\n";
      userContent += JSON.stringify(metaHints, null, 2) + "\n\n";
    }
    userContent += "HTML content:\n" + content;
    messages.push({ role: "user", content: userContent });
  } else {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: "Extract product information from this screenshot. If you cannot determine a field, return null.",
        },
        {
          type: "image_url",
          image_url: { url: content, detail: "high" },
        },
      ],
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: mode === "image" ? "gpt-4o" : "gpt-4o-mini",
      messages,
      tools: [{ type: "function", function: PRODUCT_SCHEMA }],
      tool_choice: { type: "function", function: { name: "extract_product" } },
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenAI error:", response.status, errText);
    throw new Error(`OpenAI API error (${response.status})`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    throw new Error("No structured output returned from OpenAI");
  }

  const parsed = JSON.parse(toolCall.function.arguments);

  return {
    name: parsed.name ?? null,
    shop: null, // will be set by caller (the original URL)
    size: parsed.size ?? null,
    colour: parsed.colour ?? null,
    notes: parsed.notes ?? null,
    imageUrl: parsed.imageUrl ?? null,
  };
}

// ─── Main handler ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const body = await req.json();
    const { url, screenshot } = body as {
      url?: string;
      screenshot?: string; // base64 data URL
    };

    if (!url && !screenshot) {
      return new Response(
        JSON.stringify({ error: "Provide either 'url' or 'screenshot'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result: ScrapedProduct;

    if (url) {
      console.log(`Scraping URL: ${url}`);
      const html = await fetchPage(url);
      const meta = extractMeta(html, url);
      console.log("Pre-extracted meta:", JSON.stringify(meta));

      const cleaned = cleanHtml(html);
      result = await extractWithAI(cleaned, "html", OPENAI_API_KEY, meta);

      // Set shop to the original URL
      result.shop = url;

      // Ensure image URL is absolute
      if (result.imageUrl && !result.imageUrl.startsWith("http")) {
        try {
          result.imageUrl = new URL(result.imageUrl, url).href;
        } catch {
          // leave as-is
        }
      }
    } else {
      console.log("Processing screenshot upload");
      result = await extractWithAI(screenshot!, "image", OPENAI_API_KEY);
    }

    return new Response(
      JSON.stringify({ success: true, product: result }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("scrape-product error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
