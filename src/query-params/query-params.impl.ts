import { Router } from '@remix-run/router';
import { Disposer } from 'disposer-util';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { AnyObject } from '../utils/types';

import { QueryParams } from './query-params';
import { RawQueryParams } from './query-params.types';

export class QueryParamsImpl implements QueryParams {
  private disposer = new Disposer();

  data: RawQueryParams;

  constructor(private router: Router) {
    this.data = this.getSearchParamsData();

    makeObservable(this, {
      data: observable.struct,
      set: action,
      update: action,
    });

    this.disposer.add(
      this.router.subscribe(() => {
        runInAction(() => {
          this.data = this.getSearchParamsData();
        });
      }),
    );
  }

  getSearchParamsData(search: string = location.search) {
    return Object.fromEntries(new URLSearchParams(search).entries());
  }

  buildSearchString(data: AnyObject) {
    const fixedData: AnyObject = {};

    for (const [key, value] of Object.entries(data)) {
      if (value != null) {
        fixedData[key] = value;
      }
    }

    const urlSearchParams = new URLSearchParams(fixedData);

    return urlSearchParams.size ? `?${urlSearchParams}` : '';
  }

  buildUrl(queryParams: AnyObject) {
    const search = this.buildSearchString(queryParams);
    return `${location.pathname}${search}`;
  }

  set = async (queryParams: AnyObject, replace: boolean = false) => {
    const nextUrl = this.buildUrl(queryParams);
    await this.router.navigate(nextUrl, {
      replace,
    });
  };

  update = async (queryParams: AnyObject, replace: boolean = false) => {
    await this.set(
      {
        ...this.data,
        ...queryParams,
      },
      replace,
    );
  };

  dispose() {
    this.disposer.dispose();
  }
}
