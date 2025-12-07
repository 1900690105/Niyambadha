function msToMinutes(ms) {
  return (ms / 1000 / 60).toFixed(1);
}

chrome.storage.local.get(["domainTimes"], (data) => {
  const domainTimes = data.domainTimes || {};
  const list = document.getElementById("list");

  Object.entries(domainTimes).forEach(([domain, ms]) => {
    const li = document.createElement("li");
    li.textContent = `${domain}: ${msToMinutes(ms)} min`;
    list.appendChild(li);
  });
});
