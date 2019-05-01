import { Node } from '../node'
import APP_CONFIG from '../../../app.config';
import { Coinbase } from '../../../bitcoin/model'

export class CoinbaseNode implements Node {

	id: string; 
	linkCount: number = 0;
  modelData : Coinbase
  displayText: string = "Coinbase"

	constructor(modelData: Coinbase) {
    this.id = modelData.coinbaseId;
    this.modelData = modelData
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
    let index = Math.floor(APP_CONFIG.COINBASE_SPECTRUM.length * this.normal());
    return APP_CONFIG.COINBASE_SPECTRUM[index];
  }
  
}