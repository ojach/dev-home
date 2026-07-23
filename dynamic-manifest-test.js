(() => {
  const iconUrl = "https://ojapp.app/icon/icon180b.png";

  const manifestObj = {
    name: document.title || "OJapp Test",
    short_name: (document.title || "OJapp").slice(0, 12),
    start_url: window.location.href,
    display: "standalone",
    icons: [
      {
        src: iconUrl,
        sizes: "180x180",
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
    .querySelectorAll(
      'link[rel="manifest"], link[rel~="apple-touch-icon"]'
    )
    .forEach((el) => el.remove());

  const appleIcon = document.createElement("link");
  appleIcon.rel = "apple-touch-icon";
  appleIcon.href = "https://ojapp.app/icon/icon180b.png";

  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = dataUrl;

  document.head.prepend(manifest);
  document.head.prepend(appleIcon);

  console.log("OJapp dynamic manifest inserted", manifestObj);
})();
