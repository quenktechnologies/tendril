
/**
 * Action indicates how to treat with an incomming request
 * on a route.
 *
 * A request can be handled by a handler, view or a string that will
 * result in a view.
 */
export type Action
    = Handle
    | View
  | string
;

/**
 * Routes is a map of routes a module is configured to
 * respond to.
 */
export interface Routes {

    [key: string]: Route

}

/**
 * Route describes the http method and resulting action
 * for a particular url path.
 */
export interface Route {

    [key: string]: Action

}

/**
 * Handle describes the handler that will terminate the request.
 */
export interface Handle {

    filters?: Filter[],

    handler: Handler

}

/**
 * View describes the view that will terminate the request.
 */
export interface View {

    filters?: Filter[],

    view: string

}

export type Filter = () => {}

export type Handler = () => {}
