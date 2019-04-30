import { Component, Input, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { Node} from '../../../d3';
import { AppService } from '../../../app.service'

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

  constructor(private dataService : AppService) {}

  ngAfterViewInit() {
  	this.d3Element = d3.select(this.nodeElement.nativeElement);
  	this.originalRadius = +this.d3Element.attr("r")
  }

  @HostListener("click") onClick(){
   
    console.log("User Click using Host Listener")
  }

  @HostListener("doubleClick") onDoubleClick(){
  	
    console.log("User DOUBLE Click using Host Listener")
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
      that.dataService.changeMessage("", {})
    }, 500)

	}
}

