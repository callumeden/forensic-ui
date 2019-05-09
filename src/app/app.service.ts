import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

	constructor(private http: HttpClient) { }

	private messageSource = new BehaviorSubject({});
	currentMessage = this.messageSource.asObservable();

	private dismissSource = new BehaviorSubject(null);
	currentDismissMessage = this.dismissSource.asObservable();

	changeMessage(nodeName: string, items : {}) {
    this.messageSource.next([nodeName, items])
  }

  dismissInvestigationViews() {
  	this.dismissSource.next(true);
  }

  getBlob(url: string) : Observable<Blob> {
  	return this.http.get(`${url}`, {responseType : 'blob'});
  }

}