const { token, name, url, icon } = window.__OJAPP__;

const first = !localStorage.getItem("ojapp_"+token+"_installed");

if (first) {
  localStorage.setItem("ojapp_"+token+"_installed","1");
  showCompletionCertificate({
    name,
    url,
    icon,
    countdown: 30
  });
} else {
  location.href = url;
}
