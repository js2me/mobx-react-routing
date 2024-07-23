import { ViewModelHocConfig, withViewModel } from 'mobx-vm-entities';
import { ComponentType } from 'react';
import { RouteObject } from 'react-router-dom';
import { loadable } from 'react-shared-utils/loadable';
import { generateId } from 'yammies/id';

import { withRouteBlocker } from './hoc';
import { RouteDeclaration, RouterStore } from './router';

export const createRoute = (
  routeDeclaration: RouteDeclaration,
  router: RouterStore,
  factory: Exclude<ViewModelHocConfig<any>['factory'], undefined>,
): RouteObject => {
  const {
    Model,
    Component,
    path,
    id: origId,
    loader,
    fallback = router?.fallbackComponent,
    children,
    errorBoundary = router?.errorBoundaryComponent,
    index,
    element,
  } = routeDeclaration;

  const id =
    origId ??
    (process.env.NODE_ENV === 'production'
      ? generateId()
      : `route-${generateId()}${path ? `(path:${path})` : ''}`);

  routeDeclaration.id = id;

  if (!Model && !loader) {
    return {
      id,
      children: children?.map((route) => createRoute(route, router, factory)),
      Component,
      path,
      index: index as false,
      element,
      ErrorBoundary: errorBoundary,
    };
  }

  let WrappedComponent: ComponentType<any>;

  const DummyComponent = () => null;

  if (loader) {
    WrappedComponent = withRouteBlocker(
      router,
      loadable(async () => {
        const { Model, Component } = await loader();

        const UsageComponent = Component || DummyComponent;

        return Model
          ? withViewModel(Model, {
              id,
              fallback,
              factory,
            })(UsageComponent)
          : UsageComponent;
      }, fallback),
      fallback,
    );
  } else {
    const UsageComponent = Component || DummyComponent;

    WrappedComponent = withRouteBlocker(
      router,
      Model
        ? withViewModel(Model, {
            id,
            fallback,
            factory,
          })(UsageComponent)
        : UsageComponent,
      fallback,
    );
  }

  return {
    id,
    children: children?.map((route) => createRoute(route, router, factory)),
    Component: WrappedComponent,
    path,
    index: index as false,

    element,
    ErrorBoundary: errorBoundary,
  };
};
