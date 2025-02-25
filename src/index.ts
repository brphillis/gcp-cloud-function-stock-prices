import express, { Request, Response } from "express";
import yahooFinance from "yahoo-finance2";
import { checkApiKey } from "./auth";

const app = express();

app.use(express.json());
app.use(checkApiKey);

const getStockPrice = async (ticker: string): Promise<any> => {
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

const functions = require("@google-cloud/functions-framework");

functions.http("getStockPriceFunction", (req: Request, res: Response) => {
  app(req, res);
});
