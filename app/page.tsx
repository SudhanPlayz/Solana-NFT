"use client";
import { useState } from "react"

export default function Home() {
  const [wallet, setWallet] = useState(null)

  return (
    <>
    <div className="navbar bg-base-100">
      <div className="flex-none">
        <span className="text-lg font-bold">Solana NFT Transfer App</span>
      </div>
      <div className="flex-1"></div>
      <div className="flex-none">
        <button className="btn btn-primary tooltip" data-tooltip="Connect your wallet to continue.">
          Connect Wallet
        </button>
      </div>
    </div>

    <div className="container grid grid-cols-1 gap-3 p-4 mx-auto">
      <div className="card bg-neutral shadow-xl">
        <div className="card-body flex flex-col items-center justify-center">
          <h2 className="card-title">Transfer NFT</h2>
          <p className="card-subtitle text-center">{
              wallet ?
              `You can transfer your NFT to another wallet address below.` :
              `Please connect your wallet to continue.`
          }</p>
          <div className="flex flex-col items-center justify-center">
            <img alt="NFT Image" src="https://api.unsplash.com/photos/random" width={250} height={250} />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
