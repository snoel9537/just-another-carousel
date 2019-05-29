"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_on_screen_1 = require("react-on-screen");
// IntervalHandler executes props.handler each props.timeout tick.
// It pauses if child element is not fully in viewport.
// It pauses if tab lost focus.
var IntervalHandler = /** @class */ (function (_super) {
    __extends(IntervalHandler, _super);
    function IntervalHandler() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handler = React.createRef();
        _this.startInterval = function () { return _this.handler.current.startInterval(); };
        _this.stopInterval = function () { return _this.handler.current.stopInterval(); };
        return _this;
    }
    IntervalHandler.prototype.render = function () {
        var _this = this;
        return (React.createElement(react_on_screen_1.default, null, function (_a) {
            var isVisible = _a.isVisible;
            return (React.createElement(IntervalHandlerInner, __assign({ ref: _this.handler }, _this.props, { isInViewport: isVisible })));
        }));
    };
    return IntervalHandler;
}(React.Component));
exports.IntervalHandler = IntervalHandler;
var IntervalHandlerInner = /** @class */ (function (_super) {
    __extends(IntervalHandlerInner, _super);
    function IntervalHandlerInner() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.startInterval = function () {
            if (_this.isSet())
                _this.stopInterval();
            _this.interval = setInterval(function () {
                _this.props.handler();
            }, _this.props.timeout);
        };
        _this.stopInterval = function () {
            if (!_this.isSet()) {
                return;
            }
            clearInterval(_this.interval);
            _this.interval = undefined;
        };
        _this.isSet = function () { return _this.interval !== undefined; };
        _this.handleVisibilityChange = function () {
            if (document.hidden) {
                _this.wasSetBeforeTabLeaving = _this.isSet();
                _this.stopInterval();
            }
            else {
                if (_this.wasSetBeforeTabLeaving)
                    _this.startInterval();
            }
        };
        return _this;
    }
    IntervalHandlerInner.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.isInViewport !== this.props.isInViewport) {
            if (this.props.isInViewport) {
                this.startInterval();
            }
            else {
                this.stopInterval();
            }
        }
    };
    IntervalHandlerInner.prototype.componentDidMount = function () {
        if (this.props.isInViewport)
            this.startInterval();
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    };
    IntervalHandlerInner.prototype.componentWillUnmount = function () {
        if (this.props.isInViewport)
            this.stopInterval();
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    };
    IntervalHandlerInner.prototype.render = function () {
        return React.createElement("span", null);
    };
    return IntervalHandlerInner;
}(React.Component));
