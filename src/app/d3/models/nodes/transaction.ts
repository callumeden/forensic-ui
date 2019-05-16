import APP_CONFIG from '../../../app.config';
import { Node } from '../node'
import { Transaction, NodeType } from '../../../bitcoin/model';

export class TransactionNode implements Node {

	id: string; 
	linkCount: number = 0; 
  modelData : Transaction;
  displayText: string;
  type: NodeType = NodeType.TRANSACTION;
  totalLinksInGraph : number = 1;
  _expanded: boolean = false;
  
	constructor(modelData : Transaction) {
    this.id = modelData.transactionId;
    this.modelData = modelData;
    this.displayText = this.truncateDisplayText(modelData.transactionId);
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
    return APP_CONFIG.TRANSACTION_SPECTRUM[index];
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