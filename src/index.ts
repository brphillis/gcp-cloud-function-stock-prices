import yahooFinance from "yahoo-finance2";
import express, { Request, Response } from "express";

import { Quote } from "yahoo-finance2/dist/esm/src/modules/options";

import { checkApiKey } from "./auth";

const app = express();

app.use(express.json());
app.use(checkApiKey);

const getStockPrice = async (ticker: string): Promise<Quote> => {
  try {
    const quote = await yahooFinance.quote(ticker);
    console.log(quote);
    return quote;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw new Error("Could not fetch stock data");
  }
};

app.get("/api/stock/:ticker", async (req: Request, res: Response) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    const price = await getStockPrice(ticker);
    res.json({ ticker, price });
  } catch (error) {
    res.status(500).json({ error: "Failed to get stock price" });
  }
});

// Check if we're in development mode and set the port accordingly
if (process.env.NODE_ENV === "development") {
  const port = process.env.PORT || 8080; // Default to 8080 if no port is set
  app.listen(port, () => {
    console.log(
      `Server is running in development mode on http://localhost:${port}`
    );
  });
}

const functions = require("@google-cloud/functions-framework");

functions.http("getStockPriceFunction", (req: Request, res: Response) => {
  app(req, res);
});
