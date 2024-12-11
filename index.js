import dotenv from 'dotenv';
dotenv.config();

import  { Bot } from './bot.js';

new Bot('wss://pumpportal.fun/api/data');
