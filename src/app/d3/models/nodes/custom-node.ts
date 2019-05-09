import { Node } from '../node'
import APP_CONFIG from '../../../app.config';
import { Custom, NodeType } from '../../../bitcoin/model'

export class CustomNode implements Node {

	id: string; 
	linkCount: number = 0;
  displayText: string;
  modelData: Custom;
  type: NodeType = NodeType.CUSTOM;
  totalLinksInGraph : number = 1;

	constructor(modelData : Custom) {
    this.id = modelData.name;
    this.displayText = modelData.nodeType.toString();
    this.modelData = modelData
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
    let index = Math.floor((APP_CONFIG.COINBASE_SPECTRUM.length - 1) * this.normal());
    return "rgb(0, 0, 0)"
  }
  
}