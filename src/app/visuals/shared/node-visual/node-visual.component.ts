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
  private originalRadius: number;
  private d3Element;
  private hoverTimeout;
  private isSingleClick : boolean;

  private lastEvent : MouseEvent;
  private mouseDown : boolean = false;

  constructor(private dataService : AppService, private investigationService: InvestigationService) {}

  ngAfterViewInit() {
  	this.d3Element = d3.select(this.nodeElement.nativeElement);
  	this.originalRadius = +this.d3Element.attr("r")
  }

  // @HostListener("click") 
  // onClick(){
  //   this.isSingleClick = true;
  //   let that = this;
  //   setTimeout(function() {
  //     if (that.isSingleClick) {
  //       that.handleSingleClick();
  //     }
  //   }, 250);
  // }

  @HostListener('mousemove', ['$event']) 
  onMouseMoveEvent(event) {
    // console.info('mouse mocve', this.mouseDown)
    if (this.mouseDown) {
      console.info('moving');
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDownEvent(event) {
    console.info('mouse down')
    this.mouseDown = true;
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event) {
    console.log(event);
  }

  @HostListener("dblclick") onDoubleClick(){
    this.isSingleClick = false;
    this.handleDoubleClick();
  }

  handleSingleClick() {
    console.log("Single click on node");
  }

  handleDoubleClick() {
    this.investigationService.expandNeighbours(this.node);
  }

  @HostListener('mouseover') onMouseOver(d) {
    clearTimeout(this.hoverTimeout)
    this.d3Element.transition().duration(750).attr("r", this.originalRadius * 2)
    let that = this;

    this.hoverTimeout = setTimeout(function () {
      let displayData = {};
      for (let key in that.node.modelData) {
        displayData[key] = that.node.modelData[key]
      }
      that.dataService.changeMessage(that.node.displayText, displayData)
    }, 500)
	}

	@HostListener('mouseout') onMouseOut() {
    clearTimeout(this.hoverTimeout)

    let that = this;
    this.d3Element.transition().duration(750).attr("r", this.originalRadius);

    this.hoverTimeout = setTimeout(function () {
      // that.dataService.changeMessage("", {})
    }, 500)

	}
}

