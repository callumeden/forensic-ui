import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvestigationService } from '../investigation/investigation.service';
import { AddLinkService } from './add-link.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AppService } from '../../app.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddNodeDialog } from './add-node-dialog.component';
import { faArrowsAltH } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'add-node',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.css']
})
export class AddNodeComponent implements OnInit {

	constructor (
    private router : Router, 
    private dataService : AddLinkService, 
    private appService : AppService,
    private dialog : MatDialog) {
	}

  ngOnInit() {
    const newLinkRequestSubscription = this.dataService.currentNewLinkRequest.subscribe(newLinkRequestData => {
      if (newLinkRequestData) {
        this.buildNewLink(newLinkRequestData);
      }
    });
  }

	addNewNode() {
		const dialogRef = this.dialog.open(AddNodeDialog, {
      width: '70vw',
  		data: { names: ['Frodo', 'Bilbo'] },
      panelClass: 'add-node-dialog'
		});
	}

	navigateToSearch() {
    this.appService.dismissInvestigationViews();
    this.dataService.clearLinkRequests();
		this.router.navigate(['search']);
	}

  buildNewLink(newLinkRequestData) {
    this.dialog.open(AddLinkDialog, {
      width: '70vw',
      data: newLinkRequestData,
      panelClass: 'add-link-dialog'
    });
  }
}

@Component({
  selector: 'add-link-sheet',
  templateUrl: './add-link-dialog.component.html'
})
export class AddLinkDialog implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, 
              private investigationService: InvestigationService,
              private dialogRef: MatDialogRef<AddLinkDialog>) { }

  myControl = new FormControl();
  options: string[];
  filteredOptions: Observable<string[]>;
  forward: boolean = true;
  faArrowsAltH = faArrowsAltH;

  ngOnInit() {
    this.options = this.investigationService.getAllIds();

    this.filteredOptions = this.myControl.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );

  }
  onSubmitNewLinkForm(form) {
    if (form.valid && this.investigationService.isValidId(this.myControl.value)) {
      if (this.forward) {
        this.investigationService.createCustomLink(this.data.name, this.myControl.value);
      } else {
        this.investigationService.createCustomLink(this.myControl.value, this.data.name);
      }
      
      this.dialogRef.close();
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

}