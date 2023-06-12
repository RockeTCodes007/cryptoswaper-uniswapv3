import React, { useState } from "react";
import Web3 from "web3";
import V3SwapRouterABI from "./V3SwapRouterABI";

const ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const WMATIC_ADDRESS = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
const WETH_ADDRESS = "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa";

window.ethereum.request({ method: "eth_requestAccounts" });
const web3 = new Web3(window.ethereum);
const router = new web3.eth.Contract(V3SwapRouterABI, ROUTER_ADDRESS);

function App() {
  const [amount, setAmount] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState(
    `Enter Amount to Swap.
     Enter the address.
     Click on Swap & Send.`
  );

  const [loading, setLoading] = useState(false);
  const [txcomplete, setTxcomplete] = useState(false);
  const [ahref, setAhref] = useState("");

  async function handleExecuteMain() {
    if (!window.ethereum) {
      alert("Please install MetaMask to and connect use this dex.");
      setMessage("Please install MetaMask and connect to use this dex. ");
      return;
    }

    setLoading(true);

    const accounts = await web3.eth.getAccounts();
    const inputAmount = web3.utils.toWei(amount, "ether");
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const params = {
      tokenIn: WMATIC_ADDRESS,
      tokenOut: WETH_ADDRESS,
      fee: 3000,
      recipient: recipient,
      deadline: deadline,
      amountIn: inputAmount,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    console.log(accounts[0]);

    try {
      setMessage(
        `Please wait while we swap and send the amount to given address.`
      );
      const send = await router.methods
        .exactInputSingle(params)
        .send({ from: accounts[0], value: inputAmount, gas: 1000000 });
      setMessage(
        "Transaction complete.The swapped tokens were sent to specified address."
      );
      setTxcomplete(true);
      setLoading(false);
      const hash = send.transactionHash;
      setAhref(`https://mumbai.polygonscan.com/tx/${hash}`);
    } catch (err) {
      console.log(err);
      setMessage(err);
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>CRYPTO SWAPPER</h1>
      <label>
        Amount:
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <br />
      <label>
        Recipient:
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </label>
      <br />
      <button disabled={loading ? true : false} onClick={handleExecuteMain}>
        {loading ? `Wait` : `Swap & Send`}
      </button>
      <br />
      <h1>{message}</h1>
      <div className={`message ${txcomplete ? "show" : ""}`}>
        <p style={{ display: txcomplete ? "" : "none" }}>
          Click <a href={ahref}>here</a> to view the details of the transaction
          on polygon scan.
        </p>
      </div>
    </div>
  );
}

export default App;
