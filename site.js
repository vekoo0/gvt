document.querySelectorAll("#year").forEach(el => { el.textContent = new Date().getFullYear(); });
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll("header a").forEach(link => {
  if (link.getAttribute("href") === currentPage) link.setAttribute("aria-current", "page");
});
const cateringForm = document.getElementById("catering-form");
if (cateringForm) {
  const occasionField = cateringForm.elements.namedItem("occasion");
  const locationField = cateringForm.elements.namedItem("location");
  function selectService(service) {
    if (![...occasionField.options].some(option => option.value === service)) return;
    occasionField.value = service;
    document.querySelectorAll("[data-service]").forEach(link => {
      link.classList.toggle("is-selected", link.dataset.service === service);
    });
  }
  const params = new URLSearchParams(location.search);
  selectService(params.get("hizmet"));
  const districts = [...document.querySelectorAll("[data-district]")].map(link => link.dataset.district);
  if (districts.includes(params.get("ilce"))) locationField.value = params.get("ilce");
  occasionField.addEventListener("change", () => selectService(occasionField.value));
  document.querySelectorAll("[data-service], [data-district]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      if (link.dataset.service) selectService(link.dataset.service);
      if (link.dataset.district) locationField.value = link.dataset.district;
      // Keep all form entries while choosing a service or district.
      document.getElementById("teklif").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
      document.getElementById("quote-status").textContent = link.dataset.service
        ? `${link.dataset.service} seçildi. Diğer bilgileri tamamlayabilirsiniz.`
        : `${link.dataset.district} konumu eklendi. Diğer bilgileri tamamlayabilirsiniz.`;
      (link.dataset.service ? occasionField : locationField).focus({preventScroll: true});
    });
  });
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
      `Hizmet sıklığı: ${value("frequency")}`, `Kişi sayısı: ${value("guests")}`, `Tarih: ${value("date").split("-").reverse().join(".")}`,
      `Saat: ${value("time") || "Görüşülecek"}`, `Konum: ${value("location")}`,
      `Menü / notlar: ${value("notes") || "Birlikte belirleyelim."}`,
      "Uygunluk, menü, fiyat ve teslimat / teslim alma seçeneklerini görüşebilir miyiz?"].join("\n");
    window.location.assign("https://wa.me/905343370248?text=" + encodeURIComponent(message));
  });
}
