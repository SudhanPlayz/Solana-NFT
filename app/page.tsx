"use client";
import { useEffect, useState } from "react"
import { Toaster } from 'react-hot-toast'
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js"
import { createTransferInstruction } from "@solana/spl-token";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz"
import { MetadataKey } from "@nfteyez/sol-rayz/dist/config/metaplex";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    solana: any
  }
}

interface INFT {
  mint: string;
  updateAuthority: string;
  data: {
    creators: any[];
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    uriData: {
      name: string;
      description: string;
      image: string;
      external_url: string;
      background_color: string;
    }
  };
  key: MetadataKey;
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number;
  masterEdition?: string | undefined;
  edition?: string | undefined;
}

export default function Home() {
  const [wallet, setWallet] = useState(null)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [nfts, setNfts] = useState<INFT[]>([])

  const connectWallet = async () => {
    if (window.solana) {
      const wallet = window.solana
      setWallet(wallet)
      const connection = new Connection("https://sly-boldest-haze.solana-mainnet.discover.quiknode.pro/ce8cbf142592ab1ca55baaf964aedd2887e861ad/")
      setConnection(connection)
      let v = await wallet.connect()
      setPublicKey(new PublicKey(v.publicKey))

      const nftAccounts = await getParsedNftAccountsByOwner({
        publicAddress: v.publicKey.toBase58(),
        connection: connection,
      });
      const nfts = []

      for (let nft of nftAccounts) {
        let nf = nft as INFT
        nf.data.uriData = await fetch(nft.data.uri).then(res => res.json())
        nfts.push(nf)
      }

      setNfts(nfts)
      console.log(nfts)
    }
  }

  const transferNFT = async (nft: INFT, publicKey: PublicKey, connection: Connection) => {
    const addressToSend = new PublicKey("GjakKEh4NSHeqcg5Fk2MsdCnLocM7xtbhrr3jmcG8ygA");
    const mint = new PublicKey(nft.mint);

    const sendTxPromise = new Promise(async (resolve, reject) => {
      const transferInstruction = createTransferInstruction(
        mint,
        addressToSend,
        publicKey,
        1,
        [],
      )

      const transaction = new Transaction().add(transferInstruction)
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        //@ts-ignore
        [wallet],
        {
          commitment: "confirmed",
          preflightCommitment: "confirmed",
        }
      )
      console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      resolve(true)
    })

    toast.promise(
      sendTxPromise,
      {
        loading: "Sending NFT...",
        success: "NFT Sent!",
        error: "Error sending NFT",
      },
      {
        style: {
          minWidth: "200px",
        },

        success: {
          duration: 3000,
          iconTheme: {
            primary: "#0F9960",
            secondary: "#FFFFFF",
          },
        },

        error: {
          duration: 3000,
          iconTheme: {
            primary: "#F87171",
            secondary: "#FFFFFF",
          },
        },

        loading: {
          duration: 3000,
          iconTheme: {
            primary: "#FBBF24",
            secondary: "#FFFFFF",
          },
        },
      })
  }

  useEffect(() => {
    if (wallet) {
      //@ts-ignore
      wallet.on("disconnect", () => {
        setWallet(null)
        setPublicKey(null)
      })
    }
  }, [wallet])

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <div className="navbar bg-base-100">
        <div className="flex-none">
          <span className="text-lg font-bold">Solana NFT Transfer App</span>
        </div>
        <div className="flex-1"></div>
        <div className="flex-none">
          <button className="btn btn-secondary" onClick={connectWallet} disabled={wallet ? true : false}>
            {
              publicKey ?
                "Connected " + publicKey.toBase58().substr(0, 5) + "..." + publicKey.toBase58().substr(-5) :
                "Connect Wallet"
            }
          </button>
        </div>
      </div>

      <div className="container grid grid-cols-1 p-4 mx-auto">
        <div className="card bg-neutral shadow-xl">
          <div className="card-body flex flex-col items-center justify-center">
            <h2 className="card-title">Transfer NFT</h2>
            <p className="card-subtitle text-center">{
              wallet ?
                `You can transfer your NFT to another wallet address below.` :
                `Please connect your wallet to continue.`
            }</p>
            <div className="flex flex-row items-center bg-slate-800 flex-wrap justify-center">
              {publicKey && connection && nfts.map((nft, index) => (
                <div className="flex flex-col bg-slate-900 rounded-lg m-3" key={index}>
                  <div className="flex flex-row">
                    <img src={nft.data.uriData.image} className="h-40 rounded-lg" />
                    <div className="p-3 text-white grow flex flex-col justify-around w-full">
                      <div className="text-2xl font-semibold">{nft.data.name}</div>
                      <div className="text-slate-500">Mint: <span className="text-slate-300">{nft.mint.toString().substr(0, 5) + "..." + nft.mint.toString().substr(-5)}</span></div>
                      <div className="flex flex-row text-center">
                        <div className="m-1 p-1 w-1/2 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700" onClick={() => window.open("https://explorer.solana.com/address/" + nft.mint, "_blank")}>View Mint</div>
                        <div className="m-1 p-1 w-1/2 bg-lime-600 rounded-lg cursor-pointer hover:bg-lime-700" onClick={() => transferNFT(nft, publicKey, connection)}>Transfer</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
