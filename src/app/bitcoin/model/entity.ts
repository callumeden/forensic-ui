import { Address } from './address';

export interface Entity {
	name: string;
	usesAddresses: Address[];
}