import APP_CONFIG from '../../../app.config';
import { Node } from '../node'
import { Transaction } from '../../../bitcoin/model';

export class TransactionNode implements Node {

	id: string; 
	linkCount: number = 0; 
  modelData : Transaction
  displayText: string = "Transaction"

	constructor(modelData : Transaction) {
    this.id = modelData.transactionId;
    this.modelData = modelData;
  }

  normal = () => {
    return Math.sqrt(this.linkCount / APP_CONFIG.N);
  }

  get r() {
    return 50 * this.normal() + 30;
  }

  get fontSize() {
    return (30 * this.normal() + 15) + 'px';
  }

  get color() {
    let index = Math.floor(APP_CONFIG.TRANSACTION_SPECTRUM.length * this.normal());
    return APP_CONFIG.TRANSACTION_SPECTRUM[index];
  }
}