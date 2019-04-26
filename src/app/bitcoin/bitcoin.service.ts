import { Injectable } from '@angular/core';
import { Block } from './model/block'
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BitcoinService {

	readonly serviceDomain : string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getBlock(hash : string) : Observable<Block> {
  	return this.http.get<Block>(this.serviceDomain + "/bitcoin/getBlock?hash=" + hash) 
  	.pipe(
  		tap(_ => console.info('fetched block')),
      catchError(this.handleError<Block>('getBlock'))
    );;
  }

  private handleError<T> (operation = 'operation', result?: T) {
	  return (error: any): Observable<T> => {
	 
	    // TODO: send the error to remote logging infrastructure
	    console.error(error); // log to console instead
	 
	    // TODO: better job of transforming error for user consumption
	    console.log(`${operation} failed: ${error.message}`);
	 
	    // Let the app keep running by returning an empty result.
	    return of(result as T);
	  };
	}	
}
