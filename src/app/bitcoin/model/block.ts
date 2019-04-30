import { Transaction } from './transaction';
import { Coinbase } from './coinbase'; 
export interface Block {
  hash: string;
  prevBlockHash: string;
  timestamp: number;
  size: number;
  gbp: number;
  usd: number;
  eur: number;

  parent: Block;
  child: Block;

  minedTransactions: Transaction[];

  coinbase: Coinbase;
}
