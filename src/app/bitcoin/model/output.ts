import { Transaction } from './transaction';
import { Address } from './address';

export interface Output {

	outputId: string;
	value: number;
	
	producedByTransaction: Transaction;

	inputsTransaction: Transaction;

	lockedToAddress: Address;
}