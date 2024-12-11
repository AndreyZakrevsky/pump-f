import WebSocket from 'ws';

import  { Bot } from './bot.js';


// const ws = new WebSocket('wss://pumpportal.fun/api/data');
const bot = new Bot('wss://pumpportal.fun/api/data');
//bot.trade('D4SB4KeTintFLdfMLeowGfdiNejRjmZLJ65m9V8Qpump', 50000);
//bot.buy('D4SB4KeTintFLdfMLeowGfdiNejRjmZLJ65m9V8Qpump', 50000);
//bot.sell('HZhZ2Xs3ztTyqAZ2fUZRLjJBTrAjULB79wFsD7HWpump', 50000);



//bot.start();

// ws.on('open', function open() {

//     const bot = new Bot('wss://pumpportal.fun/api/data');
//     //bot.subscribeCreate();

// // Subscribing to token creation events
// //   let payload = {
// //       method: "subscribeNewToken", 
// //     }
// //   ws.send(JSON.stringify(payload));

//   // Subscribing to trades made by accounts
// //  let payload = {
// //       method: "subscribeAccountTrade",
// //       keys: ["7ZHh3A5yUZuTq8FVrtdZXui3zH5xwpdqZMKSZk64TC8G"] // array of accounts to watch traderPublicKey
// //     }
// //   ws.send(JSON.stringify(payload));

//  // Subscribing to trades on tokens
// //  let payload = {
// //       method: "subscribeTokenTrade",
// //       keys: ["8WaNPL3K8UECVEZT2BGr2eWzDg2uzvsAUfwj18dPpump"] // array of token CAs to watch
// //     }
// //   ws.send(JSON.stringify(payload));
// });

// ws.on('message', function message(data) {
//   console.log(JSON.parse(data));
// });


// {
//     signature: '4dZUoonmFs73moeWx77kNajeXM3tQQ2ot11onKp2Xsb3JaT1XtbcSs2Rn9psCAwsw2E2SZJfMxTMBHp7hnmz5MdY',
//     mint: 'DRP8SLo52pnvxmgyAiGmeKNnwtiX7yg4rK3Ybi7Bpump',
//     traderPublicKey: '771UhU16HtTuKRbRp4Tb44koDH38W4UjpKaFEosbAaZs',
//     txType: 'create',
//     initialBuy: 51095238.095238,
//     bondingCurveKey: '3oqGTW9gwNbXtULYKN6ZhyiRbj568RxYXFZ5BjnYAhr4',
//     vTokensInBondingCurve: 1021904761.904762,
//     vSolInBondingCurve: 31.499999999999996,
//     marketCapSol: 30.82479030754892,
//     name: 'Mini Shiba Inu',
//     symbol: 'MINISHIB',
//     uri: 'https://ipfs.io/ipfs/QmZJ98LDLx8hUfoLadagGp7QK9tJW2kz3TeBYNBovgUDPs'
//   }







// Active bots ['7ZHh3A5yUZuTq8FVrtdZXui3zH5xwpdqZMKSZk64TC8G', 'orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8', '7ZHh3A5yUZuTq8FVrtdZXui3zH5xwpdqZMKSZk64TC8G']
// !!!!!! -> 8uUSB9A9mxuy85xir6foMe83Vt8vSUcNoQjiudTQpump CV63BAtRhQLfFZ7LAPMTR9d97QDkbGMJPMqnQWukqRix