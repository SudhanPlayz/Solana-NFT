"use client";
import { useEffect, useState } from "react"
import { Toaster } from 'react-hot-toast'
import { Account, Connection, PublicKey, Transaction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
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
    const addressToSend = new PublicKey("8MdXvWgNou9jRVturbfnt3egf1aP9p1AjL8wiJavti7F");

    const sendTxPromise = new Promise(async (resolve, reject) => {
      const transferInstruction = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        publicKey,
        addressToSend,
        new PublicKey(nft.updateAuthority),
        [],
        1
      );

      const tx = new Transaction().add(transferInstruction);

      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      //@ts-ignore
      const txid = await wallet.signTransaction(tx);

      const txStatus = await connection.confirmTransaction(txid, "confirmed");

      console.log(txStatus)

      if (txStatus.value.err) {
        return reject(txStatus.value.err);
      }

      resolve(txStatus.value);
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
            <div class="flex flex-row items-center bg-slate-800 flex-wrap justify-center">
              {publicKey && connection && nfts.map((nft, index) => (
                <div class="flex flex-col bg-slate-900 rounded-lg m-3" key={index}>
                  <div class="flex flex-row">
                    <img src={nft.data.uriData.image} class="h-40 rounded-lg" />
                    <div class="p-3 text-white grow flex flex-col justify-around w-full">
                      <div class="text-2xl font-semibold">{nft.data.name}</div>
                      <div class="text-slate-500">Minted by: <span class="text-slate-300">{nft.mint.toBase58().substr(0, 5) + "..." + nft.mint.toBase58().substr(-5)}</span></div>
                      <div class="flex flex-row text-center">
                        <div class="m-1 p-1 w-1/2 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700" onClick={() => window.open("https://explorer.solana.com/")}>View</div>
                        <div class="m-1 p-1 w-1/2 bg-lime-600 rounded-lg cursor-pointer hover:bg-lime-700" onClick={() => transferNFT(nft, publicKey, connection)}>Transfer</div>
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
