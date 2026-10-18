(() => {
  const button = document.getElementById('menu-import-button');
  const status = document.getElementById('menu-import-status');
  const preview = document.getElementById('menu-import-preview');
  let products = [];
  const key = name => name.trim().normalize('NFC').toLocaleLowerCase('tr-TR');
  async function prepare() {
    try {
      const response = await fetch('menu-listesi.json');
      if (!response.ok) throw new Error('Menü listesi yüklenemedi. Sayfayı yenileyin.');
      products = await response.json();
      if (!Array.isArray(products) || !products.length || products.some(p => typeof p.name !== 'string' || !p.name.trim() || !Number.isFinite(p.price) || p.price < 0)) throw new Error('Menü listesi geçersiz.');
      for (const product of products) {
        const item = document.createElement('li');
        item.textContent = `${product.name} — ${product.price.toLocaleString('tr-TR')} TL (${product.category})`;
        preview.appendChild(item);
      }
      button.textContent = `${products.length} Ürünlük Listeyi Menüye Ekle`;
      button.disabled = false;
    } catch (error) {
      status.textContent = error.message;
      button.textContent = 'Liste yüklenemedi';
    }
  }
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Yönetici oturumu ve mevcut ürünler kontrol ediliyor…';
    try {
      const auth = await db.auth.getUser();
      if (auth.error || !auth.data.user || auth.data.user.id !== ADMIN_UID) throw new Error('Yönetici hesabınızla yeniden giriş yapın.');
      const existing = await db.from('products').select('name');
      if (existing.error) throw existing.error;
      if (!Array.isArray(existing.data)) throw new Error('Mevcut ürünler kontrol edilemedi.');
      const names = new Set(existing.data.map(p => key(p.name || '')));
      const missing = products.filter(p => !names.has(key(p.name)));
      if (!missing.length) {
        status.textContent = 'Listedeki tüm ürünler zaten menüde. Yeni kayıt eklenmedi.';
        return;
      }
      status.textContent = `${missing.length} ürün ekleniyor…`;
      const result = await db.from('products').insert(missing).select('id');
      if (result.error) throw result.error;
      if (!Array.isArray(result.data) || result.data.length !== missing.length) throw new Error('Eklenen kayıt sayısı doğrulanamadı. Mevcut ürünleri kontrol edin.');
      status.textContent = `${result.data.length} ürün eklendi. ${products.length - missing.length} mevcut ürün atlandı. Fotoğrafları ürünlerin Düzenle düğmesinden ekleyebilirsiniz.`;
      await loadProducts();
    } catch (error) {
      status.textContent = 'Menü ekleme tamamlanamadı: ' + error.message;
    } finally {
      button.disabled = false;
    }
  });
  prepare();
})();
