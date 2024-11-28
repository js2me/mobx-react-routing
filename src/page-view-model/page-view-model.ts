import { AnyViewModel, ViewModel } from 'mobx-vm-entities';

import { AnyObject, EmptyObject } from '../utils/types';

export interface PageViewModel<
  Params extends AnyObject = EmptyObject,
  ParentViewModel extends AnyViewModel | null = null,
> extends ViewModel<any, ParentViewModel> {
  readonly id: string;

  /**
   * Параметры роута, которые указаны в адресной строке и описаны в роуте
   */
  pathParams: Params;

  /**
   * Все квери параметры, которые есть на текущей странице
   */
  queryParams: AnyObject;
}
