import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InvestigationService } from '../investigation/investigation.service';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload/ng2-file-upload';

export interface CustomNodeType {
  value: string;
  viewValue: string;
}
const URL = 'http://localhost:3000/api/upload';

@Component({
  selector: 'add-node-sheet',
  templateUrl: './add-node-bottom-sheet.component.html',
  styleUrls: ['./add-link.component.css']
})
export class AddNodeDialog implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, 
  						private investigationService: InvestigationService,
  						private dialogRef: MatDialogRef<AddNodeDialog>) { }


  nodeTypes : CustomNodeType[] = [
    {value: "photo-id", viewValue: "Photographic ID"}, 
    {value: "delivery", viewValue: "Delivery Information"}, 
    {value: "invoice", viewValue: "Invoice"}, 
    {value: "other", viewValue: "Other"}
  ]
  private uploading : boolean = false;
  private uploadSuccess: boolean = false;
  
  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: "photo"});
  

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('ImageUpload:uploaded:', item, status, response);
         this.uploading = false;
         this.uploadSuccess = true;
     };
  }


  addPhotoIdNode(form) {

  	if (form.valid) {
  		this.investigationService.provideNewCustomNodeData(form.value);
  		this.dialogRef.close();
  	}

  }

  saveImage(photoId) {
    this.uploading = true;
    this.uploader.uploadAll()
  }
}