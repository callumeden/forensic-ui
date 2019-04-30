import { Block } from './block';
export interface Transaction {
	transactionId: string;

	minedInBlock: Block;
}