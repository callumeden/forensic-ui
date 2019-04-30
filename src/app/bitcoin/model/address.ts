import { Output } from './output';
import { Entity } from './entity';

export interface Address {
  address: string;

  outputs: Output[];

  entity: Entity;
}
