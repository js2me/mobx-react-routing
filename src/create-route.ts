import { ViewModelCreateConfig, withViewModel } from 'mobx-vm-entities';
import { ComponentType } from 'react';
import { RouteObject } from 'react-router-dom';
import { NoopComponent } from 'react-shared-utils/components/noop-component';
import { loadable } from 'react-shared-utils/loadable';

import { withRouteBlocker } from './hoc';
import { PageViewModel } from './page-view-model';
import { RouteDeclaration, RouterStore } from './router';

declare const process: { env: { NODE_ENV?: string } };

export interface CreateRouteFunctionParams {
  declaration: RouteDeclaration;
  router: RouterStore;
  factory: CreateRouteViewModelFactory;
  createChildRoute: DefaultCreateRouteFunction;
  /**
   * Индексовое представление роута
   * @example [0, 0, 0]
   */
  parentPath: number[];
  index: number;
}

export type DefaultCreateRouteFunction = (
  params: CreateRouteFunctionParams,
) => RouteObject;

export type CreateRouteViewModelFactory = (
  config: ViewModelCreateConfig<PageViewModel<any, any>>,
  declaration: RouteDeclaration,
) => PageViewModel<any, any>;

export const createRoute: DefaultCreateRouteFunction = ({
  declaration,
  router,
  factory,
  createChildRoute,
  parentPath,
  index,
}): RouteObject => {
  const {
    Model,
    Component,
    path,
    id: origId,
    loader,
    fallback = router?.fallbackComponent,
    children,
    errorBoundary = router?.errorBoundaryComponent,
    index: isIndexRoute,
    element,
  } = declaration;

  const treePath = [...parentPath, index];

  const id =
    origId ??
    (process.env.NODE_ENV === 'production'
      ? `route-${treePath.join('-')}`
      : `route-${treePath.join('-')}(path:${path ?? '-'})`);

  declaration.id = id;

  if (!Model && !loader) {
    return {
      id,
      children: children?.map((declaration, index) =>
        createChildRoute({
          declaration,
          router,
          factory: (config) => factory(config, declaration),
          createChildRoute,
          parentPath: treePath,
          index,
        }),
      ),
      Component,
      path,
      index: isIndexRoute as false,
      element,
      ErrorBoundary: errorBoundary,
    };
  }

  let WrappedComponent: ComponentType<any>;

  if (loader) {
    WrappedComponent = withRouteBlocker(
      router,
      loadable(async () => {
        const { Model, Component } = await loader();

        const UsageComponent = Component || NoopComponent;

        return Model
          ? withViewModel(Model, {
              id,
              fallback,
              factory: (config) => factory(config, declaration),
            })(UsageComponent)
          : UsageComponent;
      }, fallback),
      fallback,
    );
  } else {
    const UsageComponent = Component || NoopComponent;

    WrappedComponent = withRouteBlocker(
      router,
      Model
        ? withViewModel(Model, {
            id,
            fallback,
            factory: (config) => factory(config, declaration),
          })(UsageComponent)
        : UsageComponent,
      fallback,
    );
  }

  return {
    id,
    children: children?.map((route, index) =>
      createChildRoute({
        declaration: route,
        router,
        factory,
        createChildRoute,
        parentPath: treePath,
        index,
      }),
    ),
    Component: WrappedComponent,
    path,
    index: isIndexRoute as false,

    element,
    ErrorBoundary: errorBoundary,
  };
};
