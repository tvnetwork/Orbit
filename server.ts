import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import ogs from "open-graph-scraper-lite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/og", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      // @ts-ignore - ogs types can be tricky
      const { result } = await ogs({ url });
      
      res.json({
        title: (result as any).ogTitle || (result as any).twitterTitle || "",
        description: (result as any).ogDescription || (result as any).twitterDescription || "",
        image: (result as any).ogImage?.[0]?.url || (result as any).ogImage?.url || (result as any).twitterImage?.[0]?.url || "",
        logo: (result as any).ogLogo?.[0]?.url || (result as any).ogLogo?.url || ""
      });
    } catch (error) {
      console.error("OG Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
