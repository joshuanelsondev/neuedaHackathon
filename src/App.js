import { useState } from "react";
import "./App.css";
import countryCurrency from "./countryCurrency";
import getFlagEmoji from "./helperFunctions/getFlagEmoji";
import ChartBox from "./components/ChartBox";

function App() {
  const [fromCountry, setFromCountry] = useState("USA");
  const [toCountry, setToCountry] = useState("France");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showChart, setShowChart] = useState(false);

  const API_KEY = process.env.REACT_APP_EXCHANGE_API_KEY;

  const handleConvert = async () => {
    setError("");
    setResult(null);
    if (!amount || isNaN(amount)) {
      setError("Please enter a valid amount.");
      return;
    }
    if (parseFloat(amount) < 0) {
      setError("Amount cannot be negative.");
      return;
    }
    if (fromCountry === toCountry) {
      setResult(amount);
      return;
    }
    setLoading(true);
    const fromCurrency = countryCurrency[fromCountry];
    const toCurrency = countryCurrency[toCountry];
    try {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`
      );
      const data = await res.json();
      if (data.result === "success") {
        setResult(data.conversion_result);
      } else {
        setError("Conversion failed. Please check your API key or try again.");
      }
    } catch (err) {
      setError("Error fetching conversion rate.");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* 🔷 Converter Section */}
        <div className="converter-box">
          <h2>Currency Converter</h2>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setResult(null); // 🔹 Clear result when user edits input
            }}
          />
          <div className="select-row">
            <select
              value={fromCountry}
              onChange={(e) => {
                setResult(null);
                setFromCountry(e.target.value);
              }}
            >
              {Object.keys(countryCurrency).map((country) => (
                <option key={country} value={country}>
                  {getFlagEmoji(country)} {country}
                </option>
              ))}
            </select>
            <button
              className="toggle-switch-button"
              onClick={() => {
                const temp = fromCountry;
                setFromCountry(toCountry);
                setToCountry(temp);
                if (amount && !isNaN(amount)) {
                  handleConvert();
                }
              }}
            >
              ⇄
            </button>

            <select
              value={toCountry}
              onChange={(e) => {
                setResult(null);
                setToCountry(e.target.value);
              }}
            >
              {Object.keys(countryCurrency).map((country) => (
                <option key={country} value={country}>
                  {getFlagEmoji(country)} {country}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleConvert} disabled={loading}>
            {loading ? "Converting..." : "Convert"}
          </button>

          {error && <div className="error-message">{error}</div>}

          {result !== null && !error && (
            <div className="result-message">
              <strong>
                {amount} {countryCurrency[fromCountry]} = {result}{" "}
                {countryCurrency[toCountry]}
              </strong>
            </div>
          )}

          <button
            onClick={() => {
              if (fromCountry === toCountry) {
                setError(
                  "Please select two different countries to view rate trends."
                );
                return;
              }
              setError(""); // clear any previous errors
              setShowChart(!showChart);
            }}
          >
            {showChart ? "Hide Rate Trend" : "Show Rate Trend"}
          </button>
        </div>

        {/* 🔷 Chart Section — shows independently of conversion */}
        {showChart && fromCountry !== toCountry && (
          <ChartBox
            base={countryCurrency[fromCountry].toLowerCase()}
            target={countryCurrency[toCountry].toLowerCase()}
          />
        )}
      </header>
    </div>
  );
}

export default App;
