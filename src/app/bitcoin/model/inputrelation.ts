import { Transaction } from './transaction';
import { Output } from './output';

export interface InputRelation {
	
	transaction : Transaction 	

	input: Output;

	gbpValue: number;
	usdValue: number;
	eurValue: number;
}