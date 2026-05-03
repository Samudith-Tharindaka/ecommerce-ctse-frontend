import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as catalog from "../api/catalog";
import { ApiError } from "../api/client";
import type { Product } from "../api/types";
import { ProductCard } from "../components/ProductCard";

type Mode = "all" | "search" | "category";

const categories = [
  { name: "Phones", icon: "📱" },
  { name: "Computers", icon: "💻" },
  { name: "SmartWatch", icon: "⌚" },
  { name: "Camera", icon: "📷" },
  { name: "HeadPhones", icon: "🎧" },
  { name: "Gaming", icon: "🎮" },
];

export function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("all");
  const [searchQ, setSearchQ] = useState("");
  const [categoryQ, setCategoryQ] = useState("");
  const pageSize = 12;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "search") {
        if (!searchQ.trim()) {
          setProducts([]);
          setTotalPages(0);
          setLoading(false);
          return;
        }
        const res = await catalog.searchProducts(searchQ.trim(), {
          page,
          size: pageSize,
        });
        setProducts(res.content);
        setTotalPages(res.totalPages);
      } else if (mode === "category") {
        if (!categoryQ.trim()) {
          setProducts([]);
          setTotalPages(0);
          setLoading(false);
          return;
        }
        const res = await catalog.productsByCategory(categoryQ.trim(), {
          page,
          size: pageSize,
          sort: "name,asc",
        });
        setProducts(res.content);
        setTotalPages(res.totalPages);
      } else {
        const res = await catalog.listProducts({
          page,
          size: pageSize,
          sort: "name,asc",
        });
        setProducts(res.content);
        setTotalPages(res.totalPages);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [mode, page, searchQ, categoryQ]);

  useEffect(() => {
    void load();
  }, [load]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setMode("search");
  }

  function showAll() {
    setMode("all");
    setCategoryQ("");
    setPage(0);
  }

  return (
    <div className="page">
      {/* Hero Banner */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "200px 1fr", 
        gap: "2rem",
        marginBottom: "3rem"
      }}>
        {/* Sidebar Categories */}
        <div style={{ borderRight: "1px solid #e0e0e0", paddingRight: "1rem" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {["Woman's Fashion", "Men's Fashion", "Electronics", "Home & Lifestyle", "Medicine", "Sports & Outdoor", "Baby's & Toys", "Groceries & Pets", "Health & Beauty"].map((cat) => (
              <li key={cat} style={{ padding: "0.75rem 0", cursor: "pointer" }} onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}>
                {cat}
              </li>
            ))}
          </ul>
        </div>

        {/* Hero Banner */}
        <div style={{ 
          background: "#000", 
          color: "#fff", 
          borderRadius: "4px",
          padding: "3rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span>🍎</span> iPhone 14 Series
            </p>
            <h2 style={{ fontSize: "3rem", fontWeight: 600, margin: "0 0 1.5rem", lineHeight: 1.2 }}>
              Up to 10%<br/>off Voucher
            </h2>
            <a href="#" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "underline" }}>
              Shop Now →
            </a>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80" 
            alt="iPhone" 
            style={{ maxHeight: "250px", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Flash Sales Section */}
      <section style={{ marginBottom: "4rem" }}>
        <div className="section-header">
          <div className="section-indicator"></div>
          <span className="section-title">Today's</span>
        </div>
        
        <div className="flash-sale-header">
          <h2 className="section-heading">Flash Sales</h2>
          <div className="countdown">
            <div className="countdown-item">
              <div className="countdown-label">Days</div>
              <div className="countdown-value">03</div>
            </div>
            <span style={{ fontSize: "2rem", color: "#db4444" }}>:</span>
            <div className="countdown-item">
              <div className="countdown-label">Hours</div>
              <div className="countdown-value">23</div>
            </div>
            <span style={{ fontSize: "2rem", color: "#db4444" }}>:</span>
            <div className="countdown-item">
              <div className="countdown-label">Minutes</div>
              <div className="countdown-value">19</div>
            </div>
            <span style={{ fontSize: "2rem", color: "#db4444" }}>:</span>
            <div className="countdown-item">
              <div className="countdown-label">Seconds</div>
              <div className="countdown-value">56</div>
            </div>
          </div>
        </div>

        {error && <p className="banner error">{error}</p>}
        {loading && <p className="muted">Loading products...</p>}

        {!loading && !error && products.length === 0 && (
          <p className="muted">No products found.</p>
        )}

        <div className="product-grid">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} showDiscount />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button className="btn primary" onClick={() => navigate("/products")}>View All Products</button>
        </div>
      </section>

      {/* Browse By Category */}
      <section style={{ marginBottom: "4rem", borderTop: "1px solid #e0e0e0", paddingTop: "3rem" }}>
        <div className="section-header">
          <div className="section-indicator"></div>
          <span className="section-title">Categories</span>
        </div>
        <h2 className="section-heading">Browse By Category</h2>

        <div className="category-grid">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="category-card"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
            >
              <div className="category-icon">{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Selling Products */}
      <section style={{ marginBottom: "4rem", borderTop: "1px solid #e0e0e0", paddingTop: "3rem" }}>
        <div className="section-header">
          <div className="section-indicator"></div>
          <span className="section-title">This Month</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="section-heading" style={{ margin: 0 }}>Best Selling Products</h2>
          <button className="btn primary" onClick={() => navigate("/products")}>View All</button>
        </div>

        <div className="product-grid">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Music Experience Banner */}
      <section style={{ 
        background: "#000", 
        color: "#fff", 
        borderRadius: "4px",
        padding: "4rem",
        marginBottom: "4rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <p style={{ color: "#00ff66", marginBottom: "1rem" }}>Categories</p>
          <h2 style={{ fontSize: "3rem", fontWeight: 600, margin: "0 0 2rem", lineHeight: 1.2 }}>
            Enhance Your<br/>Music Experience
          </h2>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { value: "23", label: "Hours" },
              { value: "05", label: "Days" },
              { value: "59", label: "Minutes" },
              { value: "35", label: "Seconds" },
            ].map((item) => (
              <div key={item.label} style={{ 
                background: "#fff", 
                color: "#000", 
                borderRadius: "50%", 
                width: "60px", 
                height: "60px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem"
              }}>
                <strong style={{ fontSize: "1rem" }}>{item.value}</strong>
                {item.label}
              </div>
            ))}
          </div>
          <button className="btn" style={{ background: "#00ff66", color: "#000", fontWeight: 600 }}>
            Buy Now!
          </button>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" 
          alt="Headphones" 
          style={{ maxHeight: "300px", objectFit: "contain" }}
        />
      </section>

      {/* Explore Our Products */}
      <section style={{ marginBottom: "4rem" }}>
        <div className="section-header">
          <div className="section-indicator"></div>
          <span className="section-title">Our Products</span>
        </div>
        
        <h2 className="section-heading">Explore Our Products</h2>

        {/* Search and Filter */}
        <div className="toolbar card">
          <form onSubmit={applySearch} className="toolbar-row">
            <label>
              <span className="label-text">Search</span>
              <input
                type="search"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search products…"
              />
            </label>
            <button type="submit" className="btn primary">
              Search
            </button>
            {mode !== "all" && (
              <button type="button" className="btn ghost" onClick={showAll}>
                Show all
              </button>
            )}
          </form>
        </div>

        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="btn ghost"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span className="muted">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              className="btn ghost"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button className="btn primary" onClick={() => navigate("/products")}>View All Products</button>
        </div>
      </section>

      {/* Features */}
      <section style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "2rem",
        padding: "3rem 0",
        borderTop: "1px solid #e0e0e0"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            background: "#000", 
            borderRadius: "50%", 
            margin: "0 auto 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ fontSize: "1.5rem" }}>🚚</span>
          </div>
          <h4 style={{ margin: "0 0 0.5rem" }}>FREE AND FAST DELIVERY</h4>
          <p style={{ color: "#7d8184", fontSize: "0.875rem", margin: 0 }}>Free delivery for all orders over $140</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            background: "#000", 
            borderRadius: "50%", 
            margin: "0 auto 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ fontSize: "1.5rem" }}>🎧</span>
          </div>
          <h4 style={{ margin: "0 0 0.5rem" }}>24/7 CUSTOMER SERVICE</h4>
          <p style={{ color: "#7d8184", fontSize: "0.875rem", margin: 0 }}>Friendly 24/7 customer support</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            background: "#000", 
            borderRadius: "50%", 
            margin: "0 auto 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ fontSize: "1.5rem" }}>✓</span>
          </div>
          <h4 style={{ margin: "0 0 0.5rem" }}>MONEY BACK GUARANTEE</h4>
          <p style={{ color: "#7d8184", fontSize: "0.875rem", margin: 0 }}>We return money within 30 days</p>
        </div>
      </section>
    </div>
  );
}
