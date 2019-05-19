import { Injectable } from '@angular/core';
import { Block, Address, Output, Transaction, Entity, Coinbase} from './model'
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BitcoinService {

	readonly serviceDomain : string = 'http://localhost:8090';
  private dateFilters?;
  private priceFilters?;

  constructor(private http: HttpClient) { }

  private buildQueryParams() {
    let queryParams = "?";
    let atLeastOneFilter = false;

     if (this.dateFilters) {
      queryParams = queryParams + "startTime=" + this.dateFilters['start'] + "&endTime=" + this.dateFilters['end'];
      atLeastOneFilter = true;
    }

    if (this.priceFilters) {
      queryParams = queryParams + "&startPrice=" + this.priceFilters['start'] + "&endPrice=" + this.priceFilters['end'] + "&priceUnit=" + this.priceFilters['unit'];
      atLeastOneFilter = true;
    }

    return atLeastOneFilter? queryParams : "";

  }

  searchForAddress(address:string, dateFilters?, priceFilters?) {
    this.dateFilters = dateFilters;
    this.priceFilters = priceFilters;
    return this.http.get<Address>(this.serviceDomain + "/bitcoin/getAddress/" + address + this.buildQueryParams()); 
  }

  getAddresses(addresses: string[]) : Observable<Address>[] {
  	let observables : Observable<Address>[] = [];
  	addresses.forEach(address => observables.push(this.getAddress(address)));
  	return observables;
  }

  getAddress(address: string) : Observable<Address> {
  	return this.http.get<Address>(this.serviceDomain + "/bitcoin/getAddress/" + address) 
  	.pipe(
  		tap(_ => console.info('got address'))
    );
  }

  getOutput(outputId : string) : Observable<Output> {
    return this.http.get<Output>(this.serviceDomain + "/bitcoin/getOutput/" + outputId + this.buildQueryParams())
    .pipe(
      tap(_ => console.info('got output')),
      catchError(this.handleError<Output>('getOutput'))
    );
  }

  getTransaction(transactionId: string) : Observable<Transaction> {
    return this.http.get<Transaction>(this.serviceDomain + "/bitcoin/getTransaction/" + transactionId + this.buildQueryParams()) 
    .pipe(
      tap(_ => console.info('got transaction')),
      catchError(this.handleError<Transaction>('getTransaction'))
    );
  }

  getBlock(hash : string) : Observable<Block> {
  	return this.http.get<Block>(this.serviceDomain + "/bitcoin/getBlock/" + hash + this.buildQueryParams()) 
  	.pipe(
  		tap(_ => console.info('success: fetched block')),
      catchError(this.handleError<Block>('getBlock'))
    );
  }

  getEntity(name : string) : Observable<Entity> {
    return this.http.get<Entity>(this.serviceDomain + "/bitcoin/getEntity/" + name)
    .pipe(
      tap(_ => console.info('success: fetched block')),
      catchError(this.handleError<Entity>('getEntity'))
    );
  }

  getCoinbase(coinbaseId: string) : Observable<Coinbase> {
    return this.http.get<Coinbase>(this.serviceDomain + "/bitcoin/getCoinbase/" + coinbaseId)
    .pipe(
      tap(_ => console.info('success: fetched block')),
      catchError(this.handleError<Coinbase>('getCoinbase'))
    );
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
