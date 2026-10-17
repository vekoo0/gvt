document.querySelectorAll("#year").forEach(el => { el.textContent = new Date().getFullYear(); });
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll("header a").forEach(link => {
  if (link.getAttribute("href") === currentPage) link.setAttribute("aria-current", "page");
});
const cateringForm = document.getElementById("catering-form");
if (cateringForm) {
  const dateField = cateringForm.elements.namedItem("date");
  const today = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  dateField.min = today();
  dateField.addEventListener("input", () => dateField.setCustomValidity(""));
  cateringForm.addEventListener("submit", event => {
    event.preventDefault();
    dateField.min = today();
    dateField.setCustomValidity(dateField.value < today() ? "Lütfen bugünü veya ileri bir tarihi seçin." : "");
    if (!cateringForm.reportValidity()) return;
    const data = new FormData(cateringForm);
    const value = name => String(data.get(name) || "").trim();
    if (!value("customer") || !value("location")) {
      document.getElementById("quote-status").textContent = "Lütfen adınızı ve konumunuzu doldurun.";
      return;
    }
    const message = ["Merhaba SOS & CO.! Toplu yemek için teklif almak istiyorum.",
      `Ad / firma: ${value("customer")}`, `Organizasyon: ${value("occasion")}`,
      `Kişi sayısı: ${value("guests")}`, `Tarih: ${value("date").split("-").reverse().join(".")}`,
      `Saat: ${value("time") || "Görüşülecek"}`, `Konum: ${value("location")}`,
      `Menü / notlar: ${value("notes") || "Birlikte belirleyelim."}`,
      "Uygunluk, menü, fiyat ve teslimat / teslim alma seçeneklerini görüşebilir miyiz?"].join("\n");
    window.location.assign("https://wa.me/905343370248?text=" + encodeURIComponent(message));
  });
}
