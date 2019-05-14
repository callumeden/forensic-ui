import { Component, Input, HostListener, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { Node} from '../../../d3';
import { AppService } from '../../../app.service'
import { InvestigationService} from '../../../components/investigation/investigation.service';

import * as d3 from 'd3';

@Component({
  selector: '[nodeVisual]',
  templateUrl: './node-visual.component.html',
  styleUrls: ['./node-visual.component.css']
})
export class NodeVisualComponent implements AfterViewInit {
  @Input('nodeVisual') private node: Node;
  @ViewChild("myNode") private nodeElement; 
  private d3Element;
  private hoverTimeout;
  private isSingleClick : boolean;

  private lastEvent : MouseEvent;
  private mouseDown : boolean = false;

  constructor(private dataService : AppService, private investigationService: InvestigationService) {}

  ngAfterViewInit() {
  	this.d3Element = d3.select(this.nodeElement.nativeElement);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDownEvent(event) {
    this.mouseDown = true;
  }

  @HostListener("dblclick") onDoubleClick(d){
    this.isSingleClick = false;
    this.handleDoubleClick(d);
  }

  handleSingleClick() {
    console.log("Single click on node");
  }

  handleDoubleClick(d) {
    this.investigationService.expandNeighbours(this.node);
    this.node.expanded = true;
  }

  @HostListener('mouseover') onMouseOver(d) {
    clearTimeout(this.hoverTimeout)
    this.d3Element.transition().duration(750).attr("r", this.node.r * 2)
    let that = this;

    this.hoverTimeout = setTimeout(function () {
      let displayData = {};
      for (let key in that.node.modelData) {
        displayData[key] = that.node.modelData[key]
      }
      that.dataService.changeMessage(that.node.type, displayData)
    }, 500)
	}

	@HostListener('mouseout') onMouseOut() {
    clearTimeout(this.hoverTimeout)

    let that = this;
    this.d3Element.transition().duration(750).attr("r", this.node.r);

	}
}

