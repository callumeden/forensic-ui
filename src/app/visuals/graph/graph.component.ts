import { Component, Input, ChangeDetectorRef, HostListener, ChangeDetectionStrategy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { D3Service, ForceDirectedGraph, Node, Link } from '../../d3';

@Component({
  selector: 'graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnChanges {
  @Input('nodes') stagingNodes : Node[];
  @Input('links') stagingLinks : Link[];
  @Input('changes') changes: number;

  nodes: Node[];
  links: Link[];

  graph: ForceDirectedGraph;
  private _options: { width, height } = { width: 800, height: 600 };

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.graph.initSimulation(this.options);
  }

  constructor(private d3Service: D3Service, private ref: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.stagingNodes && changes.stagingNodes.isFirstChange()) {
      this.nodes = this.stagingNodes;
      this.links = this.stagingLinks;
      this.graph = this.d3Service.getForceDirectedGraph(this.stagingNodes, this.stagingLinks, this.options);
      /** Binding change detection check on each tick
       * This along with an onPush change detection strategy should enforce checking only when relevant!
       * This improves scripting computation duration in a couple of tests I've made, consistently.
       * Also, it makes sense to avoid unnecessary checks when we are dealing only with simulations data binding.
       */
      this.graph.ticker.subscribe((d) => {
        this.ref.markForCheck();
      });

      this.graph.initSimulation(this.options)
    } else {
      this.graph.addNodes(this.stagingNodes);
      this.graph.addLinks(this.stagingLinks);
      this.nodes = this.stagingNodes;
      this.links = this.stagingLinks;
    }
  }

  get options() {
    return this._options = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
}
