import { Injectable } from '@angular/core';
import { Block, Address, Output, Transaction, Entity, Coinbase} from './model'
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BitcoinService {

	readonly serviceDomain : string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  searchForAddress(address: string) {
    return this.getAddress(address)
  }

  getAddresses(addresses: string[]) : Observable<Address>[] {
  	let observables : Observable<Address>[] = [];
  	addresses.forEach(address => observables.push(this.getAddress(address)));
  	return observables;
  }

  getAddress(address: string) : Observable<Address> {
  	return this.http.get<Address>(this.serviceDomain + "/bitcoin/getAddress?address=" + address) 
  	.pipe(
  		tap(_ => console.info('got address')),
      catchError(this.handleError<Address>('getAddress'))
    );
  }

  getOutput(outputId : string) : Observable<Output> {
    return this.http.get<Output>(this.serviceDomain + "/bitcoin/getOutput?id=" + outputId)
    .pipe(
      tap(_ => console.info('got output')),
      catchError(this.handleError<Output>('getOutput'))
    );
  }

  getTransaction(transactionId: string) : Observable<Transaction> {
    return this.http.get<Transaction>(this.serviceDomain + "/bitcoin/getTransaction?txid=" + transactionId)
    .pipe(
      tap(_ => console.info('got transaction')),
      catchError(this.handleError<Transaction>('getTransaction'))
    );
  }

  getBlocks(hashes: string[]) : Observable<Block>[] {
  	let observables : Observable<Block>[] = [];
  	hashes.forEach(hash => observables.push(this.getBlock(hash)));
  	return observables;
  }

  getBlock(hash : string) : Observable<Block> {
  	return this.http.get<Block>(this.serviceDomain + "/bitcoin/getBlock?hash=" + hash) 
  	.pipe(
  		tap(_ => console.info('success: fetched block')),
      catchError(this.handleError<Block>('getBlock'))
    );
  }

  getEntity(name : string) : Observable<Entity> {
    return this.http.get<Entity>(this.serviceDomain + "/bitcoin/getEntity?name=" + name)
    .pipe(
      tap(_ => console.info('success: fetched block')),
      catchError(this.handleError<Entity>('getEntity'))
    );
  }

  getCoinbase(coinbaseId: string) : Observable<Coinbase> {
    return this.http.get<Coinbase>(this.serviceDomain + "/bitcoin/getCoinbase?id=" + coinbaseId)
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
