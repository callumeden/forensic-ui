import APP_CONFIG from '../../app.config';
import { NodeType } from '../../bitcoin/model';

export interface Node extends d3.SimulationNodeDatum {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  id: string;
  linkCount: number;
  modelData;
  displayText: string;
  totalLinksInGraph : number;
  type: NodeType;

}
