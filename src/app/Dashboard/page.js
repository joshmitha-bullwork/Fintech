"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  RefreshCcw,
  Search,
  Bot,
  Loader2,
  Send,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

// --- Initial Data ---
const initialStocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 174.23,
    high: 176.5,
    low: 172.8,
    volume: "23.4M",
    change: "+1.2%",
    marketCap: "2.8T",
    sentiment: "+",
    recommendation: { buy: 3, sell: 1 },
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 245.12,
    high: 250.6,
    low: 240.9,
    volume: "15.1M",
    change: "-0.8%",
    marketCap: "850B",
    sentiment: "-",
    recommendation: { buy: 1, sell: 2 },
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 322.88,
    high: 328.0,
    low: 318.5,
    volume: "19.7M",
    change: "+0.5%",
    marketCap: "2.6T",
    sentiment: "+",
    recommendation: { buy: 4, sell: 0 },
  },
];

// --- Stock Widget ---
const StockWidget = React.memo(({ stock }) => {
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  const handleAskAi = useCallback(
    async (e) => {
      e.preventDefault();
      if (!query.trim() || loading) return;
      setLoading(true);
      setAiResponse(null);

      try {
        // NOTE: Replace 'http://localhost:5000/api/chat' 
        // with your deployed Vercel backend URL if you are testing the live site.
        const res = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `You are a financial analyst. The user asked about ${stock.symbol} (${stock.name}): ${query}`,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setAiResponse({ text: data.reply || "No response received." });
      } catch (error) {
        console.error("ChatGPT API Error:", error);
        setAiResponse({ text: `Error: ${error.message}` });
      } finally {
        setLoading(false);
        setQuery("");
      }
    },
    [query, loading, stock]
  );

  const sentimentText =
    stock.sentiment === "+" ? "Bullish (+)" : "Bearish (-)";
  const sentimentColor =
    stock.sentiment === "+" ? "text-green-500" : "text-red-500";

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col gap-4 hover:shadow-xl transition">
      {/* --- Stock Info --- */}
      <div className="border-b pb-3">
        <h2 className="text-xl font-bold">
          {stock.symbol} - {stock.name}
        </h2>
        <p className="text-gray-600">
          Price:{" "}
          <span className="text-2xl font-extrabold text-gray-800">
            ${stock.price}
          </span>
        </p>
        <div className="grid grid-cols-2 text-sm text-gray-600">
          <p>High: ${stock.high}</p>
          <p>Volume: {stock.volume}</p>
          <p>Low: ${stock.low}</p>
          <p>Market Cap: {stock.marketCap}</p>
        </div>
        <p
          className={`font-bold text-lg mt-1 ${
            stock.change.startsWith("+")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          Change: {stock.change}
        </p>
      </div>

      {/* --- Sentiment --- */}
      <div className="flex justify-between items-center pb-2">
        <div className={`text-lg font-bold ${sentimentColor}`}>
          Sentiment: {sentimentText}
        </div>
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 rounded-full font-medium bg-green-100 text-green-700">
            Buy ({stock.recommendation.buy})
          </span>
          <span className="px-3 py-1 rounded-full font-medium bg-red-100 text-red-700">
            Sell ({stock.recommendation.sell})
          </span>
        </div>
      </div>

      {/* --- AI Assistant --- */}
      <div className="border-t pt-4">
        <button
          onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
          className="w-full flex items-center justify-center py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-xl transition duration-150 shadow-sm text-sm"
        >
          <Bot className="w-5 h-5 mr-2" />
          Ask AI about {stock.symbol}
          {isAiPanelOpen ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </button>
      </div>

      {isAiPanelOpen && (
        <div className="mt-2 p-3 border border-blue-300 rounded-xl bg-blue-50 transition-all duration-300">
          <form onSubmit={handleAskAi} className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Ask about ${stock.symbol} news or outlook...`}
                disabled={loading}
                className="w-full p-2 pl-8 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`p-2 rounded-lg text-white transition duration-150 shadow-md ${
                loading || !query.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
            {aiResponse && !loading && (
              <button
                type="button"
                onClick={() => setAiResponse(null)}
                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white shadow-md"
                title="Clear AI Response"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* --- AI Response --- */}
          {aiResponse && (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <p className="font-semibold flex items-center text-blue-800 mb-2">
                <Bot className="w-4 h-4 mr-1" /> AI Analyst:
              </p>
              <div className="bg-white p-3 rounded-md text-gray-700 text-sm whitespace-pre-wrap shadow-inner border border-gray-200">
                {aiResponse.text}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ✅ FIX: Add displayName to satisfy ESLint/Next.js build requirements
StockWidget.displayName = 'StockWidget';


// --- Main Dashboard ---
export default function StockDashboard() {
  const [stocks, setStocks] = useState(initialStocks);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredStocks = useMemo(() => {
    return stocks.filter(
      (s) =>
        (filter === "all" || s.sentiment === filter) &&
        (s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [stocks, search, filter]);

  const refreshData = () => {
    const updated = stocks.map((s) => {
      const currentPrice = Number(s.price);
      const randomMovement = (Math.random() - 0.5) * 5;
      const newPrice = (currentPrice + randomMovement).toFixed(2);
      const newChange = ((randomMovement / currentPrice) * 100).toFixed(2);
      return {
        ...s,
        price: parseFloat(newPrice),
        change: `${newChange >= 0 ? "+" : ""}${newChange}%`,
      };
    });
    setStocks(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-2">
        📊 Stock Analytics Dashboard
      </h1>

      {/* --- Controls --- */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-gray-50 rounded-xl shadow-inner px-3 py-2 w-full sm:w-64 border border-gray-200">
            <Search className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none w-full bg-gray-50 text-gray-700"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {["all", "+", "-"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === type
                    ? type === "+"
                      ? "bg-green-600 text-white shadow-md"
                      : type === "-"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type === "all"
                  ? "All"
                  : type === "+"
                  ? "Bullish (+)"
                  : "Bearish (-)"}
              </button>
            ))}
          </div>

          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 text-white font-medium shadow-md hover:bg-yellow-600 transition"
          >
            <RefreshCcw size={18} /> Refresh Data
          </button>
        </div>
      </div>

      {/* --- Stock Cards --- */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock) => (
            <StockWidget key={stock.symbol} stock={stock} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center py-12 text-lg">
            No stocks found matching the criteria.
          </p>
        )}
      </div>
    </div>
  );
}