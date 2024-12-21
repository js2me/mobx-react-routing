import { AnyViewModel, ViewModel } from 'mobx-vm-entities';

import { AnyObject, EmptyObject } from '../utils/types';

export interface PageViewModel<
  Params extends AnyObject = EmptyObject,
  ParentViewModel extends AnyViewModel | null = null,
> extends ViewModel<any, ParentViewModel> {
  readonly id: string;

  /**
   * Route parameters specified in the address bar and described in the route
   */
  pathParams: Params;

  /**
   * All query parameters available on the current page
   */
  queryParams: AnyObject;
}
