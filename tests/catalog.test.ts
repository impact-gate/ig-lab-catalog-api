import { describe, it, expect } from "vitest";
import { createCatalogApp } from "../src/server.js";

describe("Catalog API Baseline Tests", () => {
  const app = createCatalogApp();

  it("lists products with total and page", async () => {
    const res = await app.inject({ method: "GET", url: "/v1/products" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.total).toBe(2);
    expect(body.products).toHaveLength(2);
    expect(body.products[0].id).toBe("prod_101");
  });

  it("gets single product with nested inventory", async () => {
    const res = await app.inject({ method: "GET", url: "/v1/products/prod_101" });
    expect(res.statusCode).toBe(200);
    const product = JSON.parse(res.body);
    expect(product.priceCents).toBe(99900);
    expect(product.inventory.inStock).toBe(true);
    expect(product.inventory.quantity).toBe(45);
  });

  it("calculates effective pricing with discount", async () => {
    const res = await app.inject({ method: "GET", url: "/v1/pricing/prod_101" });
    expect(res.statusCode).toBe(200);
    const pricing = JSON.parse(res.body);
    expect(pricing.basePriceCents).toBe(99900);
    expect(pricing.effectivePriceCents).toBe(89910);
    expect(pricing.currency).toBe("USD");
  });
});
