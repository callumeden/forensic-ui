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
  private requesting: boolean = false;

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

    if (this.node.expanded) {
      return;
    }
    
    this.requesting = true;
    this.d3Element.transition().duration(750).attr("r", this.node.r);
    this.pulsate(this.d3Element);
    this.investigationService.expandNeighbours(this.node).subscribe(response => {
      if (response) {
        this.node.expanded = true;
        this.requesting = false;
      }
    })
  }

  @HostListener('mouseover') onMouseOver(d) {
    clearTimeout(this.hoverTimeout)

    if (!this.requesting) {
      this.d3Element.transition().duration(750).attr("r", this.node.r * 2)
    }

    let that = this;

    this.hoverTimeout = setTimeout(function () {
      let displayData = {};
      for (let key in that.node.modelData) {
        displayData[key] = that.node.modelData[key]
      }
      that.dataService.changeMessage(that.node.type, displayData)
    }, 500)
	}

  pulsate(selection) {
    recursive_transitions(this);

    function recursive_transitions(that) {
      if (that.requesting) {
        selection.transition()
            .duration(400)
            .attr("r", that.node.r)
            .ease(d3.easeSinIn)
            .transition()
            .duration(800)
            .attr("r", that.node.r * 1.2)
            .ease(d3.easeBounceOut)
            .on("end", () => recursive_transitions(that));
      } else {
        // transition back to normal
        selection.transition()
            .duration(200)
            .attr("r", that.node.r)
            .attr("stroke", "white")
      }
  }
}



	@HostListener('mouseout') onMouseOut() {
    clearTimeout(this.hoverTimeout)
    if (!this.requesting) {
      this.d3Element.transition().duration(750).attr("r", this.node.r);
    }
	}
}

