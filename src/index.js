export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.wendellrowe.com") {
      url.hostname = "wendellrowe.com";
      return Response.redirect(url.toString(), 308);
    }
    if (url.pathname === "/api/inquiry") return handleInquiry(request, env);
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      if ((url.pathname === "/" || url.pathname === "/index.html") && response.headers.get("content-type")?.includes("text/html")) {
        return centerCareerCrest(response);
      }
      return response;
    }
    const notFound = await env.ASSETS.fetch(new Request(new URL("/404.html", url), request));
    const headers = new Headers(notFound.headers);
    headers.set("X-Robots-Tag", "noindex");
    return new Response(request.method === "HEAD" ? null : notFound.body, { status: 404, headers });
  },
};

async function centerCareerCrest(response) {
  const html = await response.text();
  const style = `<style id="career-crest-centering">#experience .career-visual{justify-content:center}</style>`;
  const body = html.includes("</head>") ? html.replace("</head>", `${style}</head>`) : html;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("etag");
  headers.set("cache-control", "no-cache");
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

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
