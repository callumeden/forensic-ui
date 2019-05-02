import { Output } from '../../../bitcoin/model';
import { Node } from '../node'
import APP_CONFIG from '../../../app.config';

export class OutputNode implements Node {
	id: string; 
	linkCount: number = 0; 
  modelData : Output
  displayText: string = "Output"
  totalLinksInGraph : number = 1;

  constructor(modelData: Output) {
  	this.id = modelData.outputId;
  	this.modelData = modelData;
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
    let index = Math.floor((APP_CONFIG.OUTPUT_SPECTRUM.length - 1) * this.normal());
    return APP_CONFIG.OUTPUT_SPECTRUM[index];
  }

}