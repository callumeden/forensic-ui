import { Block } from './block';
import { Transaction } from './transaction';

export interface Coinbase {
	coinbaseId: string;
	block: Block;
	inputsTransaction : Transaction;
}