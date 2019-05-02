import { Node } from '../node'
import APP_CONFIG from '../../../app.config';
import { Entity } from '../../../bitcoin/model'

export class EntityNode implements Node {

	id: string; 
	linkCount: number = 0;
  modelData : Entity
  displayText: string = "Entity"
  totalLinksInGraph : number = 0;

	constructor(modelData: Entity) {
    this.id = modelData.name;
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
    let index = Math.floor(APP_CONFIG.ENTITY_SPECTRUM.length * this.normal());
    return APP_CONFIG.ENTITY_SPECTRUM[index];
  }
  
}