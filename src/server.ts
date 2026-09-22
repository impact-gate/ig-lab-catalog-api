import Fastify from "fastify";

export function createCatalogApp() {
  const app = Fastify({ logger: false });

  const products = [
    {
      id: "prod_101",
      name: "Standard Laptop",
      description: "Business laptop 16GB",
      priceCents: 99900,
      categoryId: "cat_electronics",
      status: "active",
      tags: ["hardware", "computing"],
      inventory: { inStock: true, quantity: 45, leadDays: 2 },
    },
    {
      id: "prod_102",
      name: "Wireless Mouse",
      description: "Ergonomic bluetooth mouse",
      priceCents: 2999,
      categoryId: "cat_electronics",
      status: "active",
      tags: ["hardware", "accessories"],
      inventory: { inStock: true, quantity: 150, leadDays: 1 },
    },
  ];

  app.get("/v1/products", async (req) => {
    return { products, total: products.length, page: 1 };
  });

  app.get("/v1/products/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const found = products.find((p) => p.id === id);
    if (!found) return reply.status(404).send({ error: "Product not found" });
    return found;
  });

  app.post("/v1/products", async (req, reply) => {
    const body = req.body as any;
    const newProduct = {
      id: "prod_" + Date.now(),
      name: body.name,
      description: body.description ?? null,
      priceCents: body.priceCents,
      categoryId: body.categoryId,
      status: "active",
      tags: body.tags ?? [],
      inventory: { inStock: true, quantity: 10, leadDays: 3 },
    };
    products.push(newProduct);
    return reply.status(201).send(newProduct);
  });

  app.put("/v1/products/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const found = products.find((p) => p.id === id);
    if (!found) return reply.status(404).send({ error: "Not found" });
    Object.assign(found, req.body);
    return found;
  });

  app.delete("/v1/products/:id", async (req, reply) => {
    return reply.status(204).send();
  });

  app.get("/v1/categories", async () => {
    return {
      categories: [
        { id: "cat_electronics", name: "Electronics", slug: "electronics", parentId: null },
        { id: "cat_office", name: "Office Supplies", slug: "office", parentId: null },
      ],
    };
  });

  app.get("/v1/inventory/:productId", async (req, reply) => {
    const { productId } = req.params as { productId: string };
    const found = products.find((p) => p.id === productId);
    if (!found) return reply.status(404).send({ error: "Not found" });
    return {
      productId,
      quantity: found.inventory.quantity,
      inStock: found.inventory.inStock,
      warehouseLocations: ["US-EAST-1", "EU-CENTRAL-1"],
      restockLeadDays: found.inventory.leadDays,
    };
  });

  app.get("/v1/pricing/:productId", async (req, reply) => {
    const { productId } = req.params as { productId: string };
    const found = products.find((p) => p.id === productId);
    if (!found) return reply.status(404).send({ error: "Not found" });
    const discountPercent = 10;
    const effectivePriceCents = Math.round(found.priceCents * (1 - discountPercent / 100));
    return {
      productId,
      basePriceCents: found.priceCents,
      currency: "USD",
      discountPercent,
      effectivePriceCents,
    };
  });

  return app;
}

if (process.argv[1] && process.argv[1].endsWith("server.ts")) {
  const app = createCatalogApp();
  app.listen({ port: 3001, host: "0.0.0.0" }).then(() => {
    console.log("Catalog API running on port 3001");
  });
}
