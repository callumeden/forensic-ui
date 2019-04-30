import { Transaction } from './transaction';
export interface Output {

	outputId: string;
	value: number;
	
	producedByTransaction: Transaction;
}