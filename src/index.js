export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "www.wendellrowe.com") {
      url.hostname = "wendellrowe.com";
      return Response.redirect(url.toString(), 308);
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const notFound = await env.ASSETS.fetch(new Request(new URL('/404.html', url), request));
    const headers = new Headers(notFound.headers);
    headers.set('X-Robots-Tag', 'noindex');
    return new Response(request.method === 'HEAD' ? null : notFound.body, {
      status: 404,
      headers,
    });
  },
};
