import { Transaction } from './transaction';
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
}
