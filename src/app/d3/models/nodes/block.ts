import APP_CONFIG from '../../../app.config';
import { Node } from '../node'

export class BlockNode implements Node {

	id: string; 
	linkCount: number = 0;

	constructor(hash) {
    this.id = hash;
  }

  normal = () => {
    return Math.sqrt(this.linkCount / APP_CONFIG.N);
  }

  get r() {
    return 50 * this.normal() + 10;
  }

  get fontSize() {
    return (30 * this.normal() + 10) + 'px';
  }

  get color() {
    let index = Math.floor(APP_CONFIG.SPECTRUM.length * this.normal());
    return APP_CONFIG.SPECTRUM[index];
  }
}