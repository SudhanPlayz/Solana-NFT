"use client";
import { useState } from "react"
import { Connection, PublicKey, Wallet, Token } from '@solana/web3.js';

export default function Home() {
  const [wallet, setWallet] = useState(null)
  const [nfts, setNfts] = useState([])



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
          <div className="flex flex-row items-center justify-center">
            <div className="card bg-base-100 shadow-xl p-10">
              <div className="card-body">
                <img className="rounded-lg" src="https://picsum.photos/150/150" alt="NFT Image" />
                <div className="card-title">NFT Name</div>
                <div className="card-actions flex justify-center items-center">
                  <button className="btn btn-primary">Transfer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
