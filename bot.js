import WebSocket from "ws";
import { throttle } from 'throttle-debounce';
import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';
import bs58 from "bs58";


export class Bot {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.isReady = false;
        this.currentTokenInProcess = null;
        this.sellTimeout = null;
        this.inProcess = null;
        this.sellRetryCounter = 0;
        this.web3Connection = new Connection(
            process.env.RPC_ENDPOINT,
            'confirmed',
        );

        this.ws.onopen = () => {
            //this.tokenCreationListening();
            this.accountTradingListening(["orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8"]);
        };

        this.ws.onerror = (error) => {
            console.log("WebSocket Error:", error);
        };

        this.ws.onmessage = this.defaultHandler.bind(this);
        this.throttledTrade = throttle(7000, this.trade);
    }

    clearTimeOut(){
        if (this.sellTimeout) {
            clearTimeout(this.sellTimeout);
            this.sellTimeout = null;
        }
    }

    clearRetry(status){
        if(status || this.sellRetryCounter > 5) {
            this.sellRetryCounter = 0;
            this.inProcess = null;
        }
    }

    async trade(mint, amount, name) {
        console.log("NEW TICK ", this.inProcess);
        if(this.inProcess) {
            const successSell = await this.sell(this.inProcess.mint, this.inProcess.amount);
            this.sellRetryCounter += 1;
            this.clearTimeOut();
            this.clearRetry(successSell);
            console.log("SELL", successSell);
            return;
        }

        const successBuy = await this.buy(mint, amount);
        console.log("BUY", successBuy)

        this.sellTimeout = setTimeout(async()=>{
            this.clearTimeOut();
            if(successBuy && !this.inProcess){
                this.inProcess = {mint, amount, name};
                const successSell = await this.sell(mint, amount);
                if(successSell) {
                    this.inProcess = null;
                }
                console.log("SELL", successSell)
            }
        }, 3000)
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

    accountTradingListening(tokens) {
        const payload = {
            method: "subscribeAccountTrade",
            keys: tokens
        };
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        } else {
            console.log("Bot can not start");
        }
    }

    async buy(mint, amount) {
       const start = process.hrtime();

       try {
        const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "publicKey": process.env.PUBLIC_KEY,  // Your wallet public key
                "action": "buy",                 // "buy" or "sell"
                "mint": mint,         // contract address of the token you want to trade
                "denominatedInSol": "false",     // "true" if amount is amount of SOL, "false" if amount is number of tokens
                "amount": amount,                  // amount of SOL or tokens
                "slippage": 1,                  // percent slippage allowed
                "priorityFee": 0.00005,         // priority fee
                "pool": "pump"                   // exchange to trade on. "pump" or "raydium"
            }),
            signal: AbortSignal.timeout(450)
        });

        const diff = process.hrtime(start); 
        const responseTime = (diff[0] * 1e9 + diff[1]) / 1e6;
        console.log(`BUY TIME pumpportal.fun: ${responseTime.toFixed(3)} ms`);

        return await this.handleResponse(response);
       } catch (error) {
          return false;
       }
    }

    async sell(mint, amount) {
       const start = process.hrtime();
       try {
        const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "publicKey": process.env.PUBLIC_KEY,  // Your wallet public key
                "action": "sell",                 // "buy" or "sell"
                "mint": mint,         // contract address of the token you want to trade
                "denominatedInSol": "false",     // "true" if amount is amount of SOL, "false" if amount is number of tokens
                "amount": amount,                  // amount of SOL or tokens
                "slippage": 20,                  // percent slippage allowed
                "priorityFee": 0.00005,        // priority fee
                "pool": "pump"                   // exchange to trade on. "pump" or "raydium"
            })
        });

        const diff = process.hrtime(start); 
        const responseTime = (diff[0] * 1e9 + diff[1]) / 1e6;
        console.log(`SELL TIME pumpportal.fun: ${responseTime.toFixed(3)} ms`);

        return await this.handleResponse(response);
       } catch (error) {
          return Promise.resolve(false); 
       }
    }

    async handleResponse(response){
        if(response.status === 200) {
            const start = process.hrtime();
            const data = await response.arrayBuffer();
            const tx = VersionedTransaction.deserialize(new Uint8Array(data));
            const signerKeyPair = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY));

            tx.sign([signerKeyPair]);
            await this.web3Connection.sendTransaction(tx);

            const diff = process.hrtime(start); 
            const responseTime = (diff[0] * 1e9 + diff[1]) / 1e6;
            console.log(`CONFIRM TIME web3Connection: ${responseTime.toFixed(3)} ms`);

            return Promise.resolve(true); 
        } else {
            return Promise.resolve(false); 
        }
    }

    defaultHandler(event) {
        this.currentTokenInProcess = JSON.parse(event.data);
        const { mint, symbol, txType } = this.currentTokenInProcess;
        // console.log(this.currentTokenInProcess)
        if(txType === 'buy'){
            this.throttledTrade(mint, 250000, "TEST");
        } else if ( this.inProcess?.mint === mint ){
            this.throttledTrade(mint, 250000, "TEST");
        }
    }
}
