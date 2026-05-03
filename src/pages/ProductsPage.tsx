import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as catalog from "../api/catalog";
import { ApiError } from "../api/client";
import type { Product } from "../api/types";
import { ProductCard } from "../components/ProductCard";

const categories = [
  "Woman's Fashion",
  "Men's Fashion",
  "Electronics",
  "Home & Lifestyle",
  "Medicine",
  "Sports & Outdoor",
  "Baby's & Toys",
  "Groceries & Pets",
  "Health & Beauty",
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("category") ?? "";
  const pageSize = 12;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (q) {
        res = await catalog.searchProducts(q, { page, size: pageSize });
      } else if (cat) {
        res = await catalog.productsByCategory(cat, { page, size: pageSize, sort: "name,asc" });
      } else {
        res = await catalog.listProducts({ page, size: pageSize, sort: "name,asc" });
      }
      setProducts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [q, cat, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [q, cat]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchParams(searchInput.trim() ? { q: searchInput.trim() } : {});
  }

  function selectCategory(c: string) {
    setSearchInput("");
    setSearchParams({ category: c });
  }

  function clearFilters() {
    setSearchInput("");
    setSearchParams({});
  }

  const activeFilter = q ? `"${q}"` : cat ? `Category: ${cat}` : null;

  return (
    <div className="page">
      <div className="row spread" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>All Products</h1>
          {activeFilter && (
            <p className="subtle" style={{ margin: "0.25rem 0 0" }}>
              Showing results for <strong>{activeFilter}</strong>
            </p>
          )}
        </div>
        {activeFilter && (
          <button className="btn ghost small" onClick={clearFilters}>
            Clear filter
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem" }}>
        {/* Sidebar */}
        <aside>
          <p style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Categories</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li
              style={{
                padding: "0.5rem 0.75rem",
                cursor: "pointer",
                borderRadius: "4px",
                background: !cat && !q ? "var(--accent)" : "transparent",
                color: !cat && !q ? "#fff" : "inherit",
                marginBottom: "0.25rem",
              }}
              onClick={clearFilters}
            >
              All
            </li>
            {categories.map((c) => (
              <li
                key={c}
                style={{
                  padding: "0.5rem 0.75rem",
                  cursor: "pointer",
                  borderRadius: "4px",
                  background: cat === c ? "var(--accent)" : "transparent",
                  color: cat === c ? "#fff" : "inherit",
                  marginBottom: "0.25rem",
                  fontSize: "0.9rem",
                }}
                onClick={() => selectCategory(c)}
              >
                {c}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <div>
          {/* Search bar */}
          <form onSubmit={applySearch} className="row" style={{ marginBottom: "1.5rem" }}>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products…"
              style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "4px" }}
            />
            <button type="submit" className="btn primary small">Search</button>
          </form>

          {error && <p className="banner error">{error}</p>}
          {loading && <p className="muted">Loading…</p>}

          {!loading && !error && (
            <>
              <p className="subtle" style={{ marginBottom: "1rem" }}>
                {totalElements} product{totalElements !== 1 ? "s" : ""} found
              </p>

              {products.length === 0 ? (
                <p className="muted">No products match your search.</p>
              ) : (
                <div className="product-grid">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn ghost"
                    disabled={page <= 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="muted">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="btn ghost"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
