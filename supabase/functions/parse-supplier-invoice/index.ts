// Edge function: parses a supplier invoice PDF using Lovable AI Gateway (Gemini)
// Returns structured JSON fields.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You extract structured data from a supplier invoice (PDF or image).
Return ONLY a JSON object using this exact schema (no markdown, no commentary):
{
  "invoice_number": string|null,
  "atcud": string|null,
  "issue_date": string|null,        // ISO YYYY-MM-DD
  "due_date": string|null,          // ISO YYYY-MM-DD
  "payment_terms": string|null,
  "payment_method": string|null,    // e.g. "Transferência", "Multibanco", "Numerário"
  "supplier_name": string|null,
  "supplier_nif": string|null,
  "supplier_address": string|null,
  "supplier_email": string|null,
  "supplier_phone": string|null,
  "client_name": string|null,
  "client_nif": string|null,
  "net_total": number|null,         // base de incidência
  "vat_total": number|null,
  "total_amount": number|null,
  "currency": string|null,          // e.g. "EUR"
  "description": string|null,       // short summary of items
  "items": [                         // line items detected on the invoice
    {
      "name": string|null,           // product / equipment name
      "brand": string|null,
      "model": string|null,
      "sku": string|null,            // SKU / reference / part number
      "serial_number": string|null,  // serial number if present
      "quantity": number|null,
      "unit_price": number|null,     // before VAT
      "vat_rate": number|null,       // percentage, e.g. 23
      "warranty_years": number|null,
      "warranty_start": string|null, // ISO YYYY-MM-DD
      "warranty_end": string|null    // ISO YYYY-MM-DD
    }
  ]
}
Use European number format conversion (e.g. "1 211,20" -> 1211.20).
If a field is unknown set it to null. Always return "items" as an array (empty if no items).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdf_base64, mime_type } = await req.json();
    if (!pdf_base64) {
      return new Response(JSON.stringify({ error: "pdf_base64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dataUrl = `data:${mime_type || "application/pdf"};base64,${pdf_base64}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extrai os campos da fatura em JSON." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AI gateway error:", res.status, errText);
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse failed:", cleaned);
    }

    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-supplier-invoice error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
