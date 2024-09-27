import { Router } from '@remix-run/router';
import { PathPattern } from '@remix-run/router/utils';
import { Disposable } from 'disposer-util';
import { ComponentType } from 'react';

import type { QueryParams } from '../query-params';
import { AnyObject } from '../utils/types';

import type { LocationData, RouteMatch } from './router.types';

export interface RouterStore extends Disposable {
  /**
   * Модель для работы с квери параметрами
   * Прибит к роутеру
   */
  readonly queryParams: QueryParams;

  /**
   * Все совпадения роута, которые он нашел исходя из конфигурации роутов
   *
   * @example
   * { path: '/url/:userId', component: UserIdPage }
   * /url/user-id-1
   * -> (RouteMatch)
   * {
   *     params: { userId: "user-id-1" }
   *     pathname: '/url/user-id-1',
   *     id: route-id,
   *     path: '/url/:userId'
   * }
   */
  readonly matches: RouteMatch[];

  /**
   * Самое последнее совпадение роута
   */
  readonly lastMatch: RouteMatch | null;

  /**
   * Информация о текущей локации
   */
  readonly location: LocationData;

  /**
   * Есть ли некие блокировки на роутинг
   */
  readonly blocked: boolean;

  /**
   * Отображается в случае если роутинг заблокирован или вью и модель роута лениво загружаются
   */
  fallbackComponent?: ComponentType;

  errorBoundaryComponent?: ComponentType;

  /**
   * Заблокировать роутинг
   */
  blockRouting(id?: string): string;

  /**
   * Заблокировать роутинг по условию
   *
   * Создает mobx реакцию
   * Возвращает dispose функцию
   */
  blockRoutingIf(expression: () => boolean, id?: string): VoidFunction;

  /**
   * Удалить блокировщик роутинга
   */
  unblockRouting(id: string): void;

  /**
   * Навигация по приложению.
   * Предпочтительнее использовать этот метод, а не родной react-router-dom'а
   */
  navigate(
    to: string | { pathname: string; search?: AnyObject },
    opts?: { replace?: boolean },
  ): Promise<void>;

  /**
   * Получить экземпляр оригинального роутера (react-router-dom)
   */
  getInstance(): Router;

  back(): Promise<void>;

  findMatch(
    pathOrPattern: PathPattern | string,
  ): { params: AnyObject; pathname: string } | null;

  isMatched(pathOrPattern: PathPattern | string): boolean;
}
