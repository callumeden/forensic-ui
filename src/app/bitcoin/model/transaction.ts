import { Block } from './block';
import { Coinbase } from './coinbase';
import { InputRelation } from './inputrelation';
import { OutputRelation } from './outputrelation';

export interface Transaction {
	transactionId: string;

	minedInBlock: Block;

	inputs: InputRelation[];

	outputs: OutputRelation[];

	coinbaseInput: Coinbase;
}