import { Output } from './output';
import { Transaction } from './transaction';

export interface OutputRelation {

	output: Output

	transaction: Transaction
	
	gbpValue: number;
	usdValue: number;
	eurValue: number;
}