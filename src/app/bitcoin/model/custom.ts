import { CustomNodeType } from './custom-node-type';
import { FileItem } from 'ng2-file-upload/ng2-file-upload';

export interface Custom {
	name: string;
	nodeType: CustomNodeType;
	userProps: {};
	photoIdModel?: PhotoIdData
}

export interface PhotoIdData {
	
	file: FileItem; 
}