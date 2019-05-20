import APP_CONFIG from '../../../app.config';
import { Node } from '../node'
import { SuperNodeModel, NodeType } from '../../../bitcoin/model';

export class SuperNode implements Node {

	id: string; 
	linkCount: number = 0; 
  modelData : SuperNodeModel
  displayText: string = "Block"
  type: NodeType = NodeType.SUPERNODE;
  totalLinksInGraph : number = 1;
  _expanded: boolean = false;

	constructor(id: string, modelData : SuperNodeModel) {
    this.id = id;
    this.modelData = modelData;
    this.displayText = this.truncateDisplayText();
  }

  normal = () => {
    return Math.sqrt(this.linkCount / this.totalLinksInGraph);
  }

  get r() {
    return 150;
  }

  get fontSize() {
    return 20;
  }

  get color() {
    let index = Math.floor((APP_CONFIG.BLOCK_SPECTRUM.length - 1) * this.normal());
    return APP_CONFIG.BLOCK_SPECTRUM[index];
  }

  get expanded() : boolean {
    return this._expanded;
  }

  set expanded(expanded : boolean) {
    this._expanded = expanded;
  }

   private truncateDisplayText() {
    return 'SUPERNODE';
  }
}