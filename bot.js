import WebSocket from "ws";
import { throttle } from 'throttle-debounce';
import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';
import bs58 from "bs58";


const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const SOLANA_PK = '4bjWNv8BoGpGt3x5dGBjNBSAK17ZF8GdpdAmhQKj6EXvYDNH43tLQmePe7KYvbiCdPmzzMePbrBkVhoGdhM7fQNx'
const myPublicKey = '3vYLTM7mwmxAj1frW957FVNUDkc1cpLsLtHDCwnECZDe'


export class Bot {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.isReady = false;
        this.currentTokenInProcess = null;
        this.inProcess = false;
        this.web3Connection = new Connection(
            RPC_ENDPOINT,
            'confirmed',
        );
        console.log("STARTTTTTTTTTT")

        this.ws.onopen = () => {
            //console.log("Connection opened");
            //this.tokenCreationListening();
            //this.accountTradingListening();
        };

        this.ws.onclose = () => {
            this.isReady = false;
            console.log("Connection closed");
        };

        this.ws.onerror = (error) => {
            console.log("WebSocket Error:", error);
        };

        this.ws.onmessage = this.defaultHandler.bind(this);
        this.throttledTrade = throttle(10000, this.trade);
    }

    async trade(mint, amount) {
        console.log("NEW TICK ", this.inProcess);
        if(this.inProcess){
            const successSell = await this.sell(this.inProcess.mint, this.inProcess.amount);
            if(successSell) {
                this.inProcess = null;
            }
            console.log("SELL", successSell)
            return;
        }

        const successBuy = await this.buy(mint, amount);
        console.log("BUY", successBuy)

        // if(successBuy && !this.inProcess){
        //     this.inProcess = {mint, amount};
        //     const successSell = await this.sell(mint, amount);
        //     if(successSell) {
        //         this.inProcess = null;
        //     }
        //     console.log("SELL", successSell)
        // }
        setTimeout(async()=>{
            if(successBuy && !this.inProcess){
                this.inProcess = {mint, amount};
                const successSell = await this.sell(mint, amount);
                if(successSell) {
                    this.inProcess = null;
                }
                console.log("SELL", successSell)
            }
        }, 1500)
    }

    setHandler(methodName) {
        if (typeof this[methodName] === "function") {
            this.ws.onmessage = this[methodName].bind(this);
            console.log(`Handler set to ${methodName}`);
        } else {
            console.log("Method not found:", methodName);
        }
    }

    tokenCreationListening() {
        const payload = {
            method: "subscribeNewToken",
        };
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        } else {
            console.log("Bot can not start");
        }
    }

    accountTradingListening() {
        const payload = {
            method: "subscribeAccountTrade",
            keys: ["orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8"]
        };
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        } else {
            console.log("Bot can not start");
        }
    }

    async buy(mint, amount) {

       try {
        const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "publicKey": myPublicKey,  // Your wallet public key
                "action": "buy",                 // "buy" or "sell"
                "mint": mint,         // contract address of the token you want to trade
                "denominatedInSol": "false",     // "true" if amount is amount of SOL, "false" if amount is number of tokens
                "amount": amount,                  // amount of SOL or tokens
                "slippage": 1,                  // percent slippage allowed
                "priorityFee": 0.000005,         // priority fee
                "pool": "pump"                   // exchange to trade on. "pump" or "raydium"
            })
        });

        return await this.handleResponse(response);
       } catch (error) {
          return false;
       }
    }

    async sell(mint, amount) {
       try {
        const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "publicKey": myPublicKey,  // Your wallet public key
                "action": "sell",                 // "buy" or "sell"
                "mint": mint,         // contract address of the token you want to trade
                "denominatedInSol": "false",     // "true" if amount is amount of SOL, "false" if amount is number of tokens
                "amount": amount,                  // amount of SOL or tokens
                "slippage": 50,                  // percent slippage allowed
                "priorityFee": 0.000005,        // priority fee
                "pool": "pump"                   // exchange to trade on. "pump" or "raydium"
            })
        });

        return await this.handleResponse(response);
       } catch (error) {
          return Promise.resolve(false); 
       }
    }

    async handleResponse(response){
        if(response.status === 200) {
            const data = await response.arrayBuffer();
            const tx = VersionedTransaction.deserialize(new Uint8Array(data));
            const signerKeyPair = Keypair.fromSecretKey(bs58.decode(SOLANA_PK));

            tx.sign([signerKeyPair]);
            await this.web3Connection.sendTransaction(tx)

            return Promise.resolve(true); 
        } else {
            return Promise.resolve(false); 
        }
    }

    defaultHandler(event) {
        this.currentTokenInProcess = JSON.parse(event.data);
        const {mint, name, txType } = this.currentTokenInProcess;

        //this.throttledTrade(mint, 25000);
        // console.log("DDDDDDDD ",this.currentTokenInProcess)
        // if(txType === 'buy'){
        //     this.throttledTrade(mint, 0.001);
        // }

        //if(!name || name !== name.toUpperCase()) return; // filter uppercase name

       // this.throttledTrade(mint, 0.001);
    }
}
