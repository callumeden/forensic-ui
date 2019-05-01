import { Block } from './block';
import { Output } from './output';
import { Coinbase } from './coinbase';

export interface Transaction {
	transactionId: string;

	minedInBlock: Block;

	inputs: Output[];

	coinbaseInput: Coinbase;
}