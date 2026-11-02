
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
  });

  async function fetchProducts() {
    try {
      setError("");

      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error("Ürünler yüklenemedi.");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });

      if (!response.ok) {
        throw new Error("Ürün eklenemedi.");
      }

      setForm({
        name: "",
        price: "",
        stock: "",
      });

      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">KUBERNETES E-COMMERCE PLATFORM</p>
          <h1>Ürün Yönetimi</h1>
          <p className="subtitle">
            Kubernetes üzerinde çalışan e-ticaret uygulaması
          </p>
        </div>

        <span className="status">
          <span className="status-dot"></span>
          Sistem aktif
        </span>
      </header>

      <section className="content">
        <div className="section-heading">
          <div>
            <h2>Yeni Ürün Ekle</h2>
            <p>Ürün bilgilerini doldurarak kataloğa ekle.</p>
          </div>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Ürün adı"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Fiyat (₺)"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="stock"
            placeholder="Stok miktarı"
            min="0"
            value={form.stock}
            onChange={handleChange}
            required
          />

          <button type="submit">+ Ürün Ekle</button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="section-heading products-heading">
          <div>
            <h2>Ürün Kataloğu</h2>
            <p>Veritabanındaki kayıtlı ürünler.</p>
          </div>

          <span className="product-count">
            {products.length} ürün
          </span>
        </div>

        {loading ? (
          <p>Ürünler yükleniyor...</p>
        ) : products.length === 0 ? (
          <p>Henüz ürün bulunmuyor.</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <span className="product-id">#{product.id}</span>

                <h3>{product.name}</h3>

                <p className="price">
                  {Number(product.price).toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </p>

                <p className="stock">Stok: {product.stock}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        Flask · PostgreSQL · Kubernetes · React
      </footer>
    </main>
  );
}

export default App;
