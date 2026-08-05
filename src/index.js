export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "www.wendellrowe.com") {
      url.hostname = "wendellrowe.com";
      return Response.redirect(url.toString(), 308);
    }

    return env.ASSETS.fetch(request);
  },
};
