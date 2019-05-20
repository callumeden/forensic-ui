import { Node } from '../node'
import APP_CONFIG from '../../../app.config';
import { Address, NodeType } from '../../../bitcoin/model'

export class AddressNode implements Node {

	id: string; 
	linkCount: number = 0;
  modelData : Address;
  displayText: string;
  type: NodeType = NodeType.ADDRESS;
  totalLinksInGraph : number = 1;
  _expanded: boolean = false;

	constructor(address : string, modelData: Address, expanded? : boolean) {
    this.id = address;
    this.modelData = modelData
    if (expanded) {
      this._expanded = true;
    }

    this.displayText = this.truncateDisplayText(address);
  }

  normal = () => {
  	return Math.sqrt(this.linkCount / this.totalLinksInGraph);
  }

  get r() {
    return (50 * this.normal()) + 30;
  }

  get fontSize() {
    return (20 * this.normal() + 15) + 'px';
  }

  get color() {
    let index = Math.floor((APP_CONFIG.ADDRESS_SPECTRUM.length - 1) * this.normal());
    return APP_CONFIG.ADDRESS_SPECTRUM[index];
  }

  get expanded() : boolean {
    return this._expanded;
  }

  set expanded(expanded : boolean) {
    this._expanded = expanded;
  }

  private truncateDisplayText(text: string) {
    return text.slice(0, 6) + '...';
  }
  
}