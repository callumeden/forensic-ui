import { Node } from './';

export class Link implements d3.SimulationLinkDatum<Node> {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  x?: number;
  y?: number;

  // must - defining enforced implementation properties
  source: Node | string | number;
  target: Node | string | number;
  type: string;

  constructor(source, target, type: string) {
    this.source = source;
    this.target = target;
    this.type = type;
  }
}
