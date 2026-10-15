export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.wendellrowe.com") {
      url.hostname = "wendellrowe.com";
      return Response.redirect(url.toString(), 308);
    }
    if (url.pathname === "/api/inquiry") return handleInquiry(request, env);
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    // Serve the branded 404 page. Request "/404" (not "/404.html"): with
    // html_handling "auto-trailing-slash", "/404.html" answers with a 307 to
    // "/404" and an empty body, which used to make every missing page blank.
    const notFound = await env.ASSETS.fetch(new Request(new URL("/404", url)));
    const headers = new Headers(notFound.headers);
    headers.delete("location");
    headers.set("X-Robots-Tag", "noindex");
    headers.set("Cache-Control", "no-store");
    return new Response(request.method === "HEAD" ? null : notFound.body, { status: 404, headers });
  },
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

async function handleInquiry(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const origin = request.headers.get("Origin");
  if (origin && origin !== "https://wendellrowe.com") return json({ error: "Origin not allowed." }, 403);

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const name = clean(data.name, 120);
  const organization = clean(data.organization, 160);
  const email = clean(data.email, 254);
  const purpose = clean(data.purpose, 80);
  const message = clean(data.message, 4000);

  if (!name || !email || !purpose || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Please complete the required fields." }, 400);
  }
  if (clean(data.website, 120)) return json({ ok: true });

  const subject = "Strategic conversation \u2014 " + purpose;
  const text = [
    "Name: " + name,
    "Organization: " + (organization || "Not provided"),
    "Email: " + email,
    "Purpose: " + purpose,
    "",
    message,
  ].join("\n");

  try {
    await env.EMAIL.send({
      from: "Wendell Rowe <inquiries@wendellrowe.com>",
      to: "hello@wendellrowe.com",
      replyTo: name ? `${name} <${email}>` : email,
      subject,
      text,
    });
    return json({ ok: true });
  } catch (err) {
    console.error("Inquiry delivery failed:", err?.message || err);
    return json({ error: "We could not send your inquiry. Please try again or email hello@wendellrowe.com." }, 502);
  }
}

function clean(value, max) {
  return String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}
