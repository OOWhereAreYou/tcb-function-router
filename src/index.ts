// v1.0.1

function compose(middleware: Function[]) {
  if (!Array.isArray(middleware))
    throw new TypeError("Middleware stack must be an array!");
  for (const fn of middleware) {
    if (typeof fn !== "function")
      throw new TypeError("Middleware must be composed of functions!");
  }
  return function (context: IContext, next: Function) {
    let index = -1;
    return dispatch(0);
    function dispatch(i: number): any {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

const route: Function = (path: string | string[], cb: Function) => {
  return async (ctx: IContext, next: Function) => {
    let isMatch = false;
    let pathIsArray = Array.isArray(path);
    let url = ctx.event.$url;
    if (!url) await next();

    if (pathIsArray) {
      for (let i = 0; i < path.length; i++) {
        if ((url + "/").indexOf(path[i] + "/") > -1) {
          isMatch = true;
          break;
        }
      }
    } else {
      isMatch = (url + "/").indexOf(path + "/") > -1;
    }
    if (isMatch) {
      return await cb(ctx, next);
    } else {
      return await next();
    }
  };
};

const createServe: Function = (fn: Function) => {
  return function serve(event: IEvent, context: any) {
    const ctx: IContext = createContext(event, context);
    return fn(ctx).then(() => {
      return {
        status: ctx.status,
        data: ctx.body,
      };
    });
  };
};

const createContext = (event: IEvent, context: any) => {
  return {
    event,
    context,
    params: event.params,
    body: {},
    status: 200,
  };
};

export interface IEvent {
  $url: string;
  params?: any;
}
export interface IContext {
  event: IEvent;
  context: any;
  body: any;
  params: any;
  status: number;
  other?: any;
}

const run = (event: any, context: IContext, r: any) => {
  if (r) {
    return createServe(
      compose([
        async (ctx: IContext, next: Function) => {
          ctx.body.app = "app.js";
          await next();
        },
        r,
      ])
    )(event, context);
  }
  return createServe(
    compose([
      async (ctx: IContext, next: Function) => {
        await next();
      },
    ])
  )(event, context);
};

export { createServe, compose, route, run };
