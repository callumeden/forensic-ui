import { LockedToRelation } from './lockedtorelation';
import { Entity } from './entity';

export interface Address {
  address: string;

  outputs: LockedToRelation[];

  entity: Entity;

  inputHeuristicLinkedAddresses: Address[];

  hasLinkedAddresses: boolean;
}
