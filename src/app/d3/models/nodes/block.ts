import APP_CONFIG from '../../../app.config';
import { Node } from '../node'
import { Block } from '../../../bitcoin/model';

export class BlockNode implements Node {

	id: string; 
	linkCount: number = 0; 
  modelData : Block
  displayText: string = "Block"
  totalLinksInGraph : number = 1;

	constructor(modelData : Block) {
    this.id = modelData.hash;
    this.modelData = modelData;
  }

  normal = () => {
    return Math.sqrt(this.linkCount / this.totalLinksInGraph);
  }

  get r() {
    return 50 * this.normal() + 30;
  }

  get fontSize() {
    return (20 * this.normal() + 15) + 'px';
  }

  get color() {
    let index = Math.floor((APP_CONFIG.BLOCK_SPECTRUM.length - 1) * this.normal());
    return APP_CONFIG.BLOCK_SPECTRUM[index];
  }
}