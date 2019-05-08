import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef } from '@angular/material';
import { InvestigationService } from '../investigation/investigation.service';
import { AddLinkService } from './add-link.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'add-node',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.css']
})
export class AddNodeComponent implements OnInit {

	constructor (private router : Router, private bottomSheet: MatBottomSheet, private dataService : AddLinkService,) {
	}

  ngOnInit() {
    const newLinkRequestSubscription = this.dataService.currentNewLinkRequest.subscribe(newLinkRequestData => {
      if (newLinkRequestData) {
        this.buildNewLink(newLinkRequestData);
      }
    });
  }

	addNewNode() {
		const bottomSheetRef = this.bottomSheet.open(AddNodeBottomSheet, {
  		data: { names: ['Frodo', 'Bilbo'] },
		});
	}

	navigateToSearch() {
		this.router.navigate(['search']);
	}

  buildNewLink(newLinkRequestData) {
    this.bottomSheet.open(AddLinkBottomSheet, {
      data: newLinkRequestData
    });
  }
}

@Component({
  selector: 'add-node-sheet',
  templateUrl: './add-node-bottom-sheet.component.html'
})
export class AddNodeBottomSheet {

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any, 
  						private investigationService: InvestigationService,
  						private bottomSheetRef: MatBottomSheetRef<AddNodeBottomSheet>) { }

  onSubmitNewNodeForm(form) {

  	if (form.valid) {
  		this.investigationService.provideNewCustomNodeData(form.value);
  		this.bottomSheetRef.dismiss();
  	}

  }
}

@Component({
  selector: 'add-link-sheet',
  templateUrl: './add-link-bottom-sheet.component.html'
})
export class AddLinkBottomSheet implements OnInit {

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any, 
              private investigationService: InvestigationService,
              private bottomSheetRef: MatBottomSheetRef<AddLinkBottomSheet>) { }

  myControl = new FormControl();
  options: string[];
  filteredOptions: Observable<string[]>;

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
      this.investigationService.createCustomLink(this.data, this.myControl.value);
      this.bottomSheetRef.dismiss();
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

}