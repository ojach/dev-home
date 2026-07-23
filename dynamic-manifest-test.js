(() => {
  const iconUrl = "https://ojapp.app/icon/icon-512.png";

  const manifestObj = {
    name: document.title || "OJapp Test",
    short_name: (document.title || "OJapp").slice(0, 12),
    start_url: window.location.href,
    display: "standalone",
    icons: [
      {
        src: iconUrl,
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };

  const json = JSON.stringify(manifestObj);

  const dataUrl =
    "data:application/manifest+json;base64," +
    btoa(unescape(encodeURIComponent(json)));

  document
    .querySelectorAll('link[rel="manifest"]')
    .forEach(el => el.remove());

  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = dataUrl;

  document.head.prepend(manifest);

  console.log("OJapp dynamic manifest inserted", manifestObj);
})();
