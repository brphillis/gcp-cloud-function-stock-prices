"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(auth_1.checkApiKey);
const getStockPrice = (ticker) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quote = yield yahoo_finance2_1.default.quote(ticker);
        console.log(quote);
        return quote;
    }
    catch (error) {
        console.error("Error fetching stock data:", error);
        throw new Error("Could not fetch stock data");
    }
});
app.get("/api/stock/:ticker", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ticker = req.params.ticker.toUpperCase();
    try {
        const price = yield getStockPrice(ticker);
        res.json({ ticker, price });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get stock price" });
    }
}));
// Check if we're in development mode and set the port accordingly
if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || 8080; // Default to 8080 if no port is set
    app.listen(port, () => {
        console.log(`Server is running in development mode on http://localhost:${port}`);
    });
}
const functions = require("@google-cloud/functions-framework");
functions.http("getStockPriceFunction", (req, res) => {
    app(req, res);
});
