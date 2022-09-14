"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.route = exports.compose = exports.createServe = void 0;
function compose(middleware) {
    if (!Array.isArray(middleware))
        throw new TypeError("Middleware stack must be an array!");
    for (const fn of middleware) {
        if (typeof fn !== "function")
            throw new TypeError("Middleware must be composed of functions!");
    }
    return function (context, next) {
        let index = -1;
        return dispatch(0);
        function dispatch(i) {
            if (i <= index)
                return Promise.reject(new Error("next() called multiple times"));
            index = i;
            let fn = middleware[i];
            if (i === middleware.length)
                fn = next;
            if (!fn)
                return Promise.resolve();
            try {
                return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
    };
}
exports.compose = compose;
const route = (path, cb) => {
    return (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        let isMatch = false;
        let pathIsArray = Array.isArray(path);
        let url = ctx.event.$url;
        if (!url)
            yield next();
        if (pathIsArray) {
            for (let i = 0; i < path.length; i++) {
                if ((url + "/").indexOf(path[i] + "/") > -1) {
                    isMatch = true;
                    break;
                }
            }
        }
        else {
            isMatch = (url + "/").indexOf(path + "/") > -1;
        }
        if (isMatch) {
            return yield cb(ctx, next);
        }
        else {
            return yield next();
        }
    });
};
exports.route = route;
const createServe = (fn) => {
    return function serve(event, context) {
        const ctx = createContext(event, context);
        return fn(ctx).then(() => {
            return {
                status: ctx.status,
                data: ctx.body,
            };
        });
    };
};
exports.createServe = createServe;
const createContext = (event, context) => {
    return {
        event,
        context,
        params: event.params,
        body: {},
        status: 200,
    };
};
const run = (event, context, r) => {
    if (r) {
        return createServe(compose([
            (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
                ctx.body.app = "app.js";
                yield next();
            }),
            r,
        ]))(event, context);
    }
    return createServe(compose([
        (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
            yield next();
        }),
    ]))(event, context);
};
exports.run = run;
