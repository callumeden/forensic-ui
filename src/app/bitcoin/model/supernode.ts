import { Address } from './address';

export interface SuperNodeModel {
	
	addresses: Address[];

	knownEntities?: string[];
}