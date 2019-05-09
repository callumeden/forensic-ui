import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InvestigationService } from '../investigation/investigation.service';
import { FileUploader, FileSelectDirective, FileItem } from 'ng2-file-upload/ng2-file-upload';
import { Custom, CustomNodeType } from '../../bitcoin/model';

export interface CustomNodeOptions {
  value: string;
  viewValue: string;
}
const URL = 'http://localhost:3000/api/upload';

@Component({
  selector: 'add-node-sheet',
  templateUrl: './add-node-dialog.component.html',
  styleUrls: ['./add-link.component.css']
})
export class AddNodeDialog implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, 
  						private investigationService: InvestigationService,
  						private dialogRef: MatDialogRef<AddNodeDialog>) { }


  nodeTypes : CustomNodeOptions[] = [
    {value: "photo-id", viewValue: "Photographic ID"}, 
    {value: "delivery", viewValue: "Delivery Information"}, 
    {value: "invoice", viewValue: "Invoice"}, 
    {value: "other", viewValue: "Other"}
  ]
  private uploading : boolean = false;
  private uploadSuccess: boolean = false;
  private uploadedFile : FileItem;
  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: "photo"});
  

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('ImageUpload:uploaded:', item, status, response);
         this.uploading = false;
         this.uploadSuccess = true;
         this.uploadedFile = item;
     };
  }

  addPhotoIdNode(form) {
  	if (form.valid && this.uploadSuccess) {
      let photoIdModel = {file: this.uploadedFile}
      let model : Custom = {name: form.value.name, nodeType: CustomNodeType.PHOTO_ID, photoIdModel: photoIdModel};

  		this.investigationService.provideNewCustomNodeData(model);
  		this.dialogRef.close();
  	}

  }

  saveImage(photoId) {
    this.uploading = true;
    this.uploader.uploadAll()
  }
}