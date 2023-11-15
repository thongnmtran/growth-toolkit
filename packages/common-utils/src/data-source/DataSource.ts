import { Observable, Observer, Subscriber } from 'rxjs';
import { OnFinally, OnFullfilled, OnRejected } from '../types';
import { newPromise } from '../common';

export class DataSource<Type> {
  obserable!: Observable<Type>;
  subscribers: Subscriber<Type>[] = [];
  promiseCtl = newPromise<Type>();
  lastResult!: Type;

  constructor() {
    this.obserable = new Observable<Type>((subscriber) => {
      this.subscribers.push(subscriber);
    });

    this.subscribe({
      next: (value) => {
        this.lastResult = value;
      },
      complete: () => {
        this.promiseCtl.resolve(this.lastResult);
      },
      error: (err) => {
        this.promiseCtl.reject(err);
      },
    });
  }

  subscribe(
    observerOrNext?: Partial<Observer<Type>> | ((value: Type) => void)
  ) {
    return this.obserable.subscribe(observerOrNext);
  }

  next(data: Type) {
    this.subscribers.forEach((subscriber) => {
      subscriber.next(data);
    });
  }

  complete() {
    this.subscribers.forEach((subscriber) => {
      subscriber.complete();
    });
  }

  error(error?: unknown) {
    this.subscribers.forEach((subscriber) => {
      subscriber.error(error);
    });
  }

  unsubscribe() {
    this.subscribers.forEach((subscriber) => {
      subscriber.unsubscribe();
    });
  }

  // --- Promisable

  then(onFullfilled?: OnFullfilled<Type>, onRejected?: OnRejected<Type>) {
    return this.promiseCtl.promise.then(onFullfilled, onRejected);
  }

  catch(onRejected: OnRejected<Type>) {
    return this.promiseCtl.promise.catch(onRejected);
  }

  finally(onfinally: OnFinally<Type>) {
    return this.promiseCtl.promise.finally(onfinally);
  }
}
