import { AnyViewModel } from 'mobx-vm-entities';

import { AnyObject, EmptyObject } from '../utils/types';

import { PageViewModelImpl } from './page-view-model.impl';

/**
 * @deprecated Will be removed in 5.0.0. Please use {@link PageViewModelImpl} instead
 */
export abstract class AbstractPageViewModel<
  Params extends AnyObject = EmptyObject,
  ParentViewModel extends AnyViewModel | null = null,
> extends PageViewModelImpl<Params, ParentViewModel> {}
