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
var interval_handler_1 = require("./interval-handler");
var Carousel = /** @class */ (function (_super) {
    __extends(Carousel, _super);
    function Carousel(props) {
        var _this = _super.call(this, props) || this;
        _this.itemsRef = React.createRef();
        _this.intervalHandlerRef = React.createRef();
        _this.MINIMUM_SENSITIVE_MOVE = 30; // px
        _this.getId = function () {
            return Date.now().toString().slice(-8) +
                Math.random().toString(36).slice(2);
        };
        _this.getOriginalItemByIndex = function (_a) {
            var data = _a.data, index = _a.index;
            var realIndex = index % data.length;
            if (realIndex < 0)
                realIndex = data.length + realIndex;
            return data[realIndex];
        };
        // generate list with surroundings and repeating
        _this.initList = function (_a) {
            var data = _a.data, size = _a.size, aroundItemsCount = _a.aroundItemsCount, shift = _a.shift;
            var list = [];
            for (var i = -aroundItemsCount; i < size + aroundItemsCount; i++) {
                var originalItem = _this.getOriginalItemByIndex({ data: data, index: i });
                list.push(__assign({}, originalItem, { id: _this.getId() }));
            }
            if (shift)
                list = list.slice(shift).concat(list.slice(0, shift));
            return list;
        };
        _this.shouldReInit = function (prevProps) {
            var sizeChanged = prevProps.size !== _this.props.size;
            var lengthChanged = prevProps.data.length !== _this.props.data.length;
            return sizeChanged || lengthChanged;
        };
        _this.reInitMounted = function () {
            var _a = _this.props, size = _a.size, data = _a.data, shift = _a.shift;
            if (!_this.hasItemsRefWidth())
                return;
            var aroundItemsCount = _this.calculateAroundItemsCount();
            _this.setState({
                aroundItemsCount: aroundItemsCount,
                list: _this.initList({ aroundItemsCount: aroundItemsCount, size: size, data: data, shift: shift })
            });
        };
        _this.hasItemsRefWidth = function () {
            return _this.itemsRef.current.getClientRects()[0] &&
                window.document.body.getClientRects()[0];
        };
        _this.calculateAroundItemsCount = function () {
            var _a = _this.props, size = _a.size, data = _a.data;
            var activeBlockWidth = _this.itemsRef.current.getClientRects()[0].width;
            var bodyWidth = window.document.body.getClientRects()[0].width;
            var oneSectionWidth = activeBlockWidth / size;
            var sidesCount = 2;
            var leftSideAndRightSideWidth = bodyWidth - activeBlockWidth;
            var oneSidePicturesCount = Math.ceil(leftSideAndRightSideWidth / oneSectionWidth / sidesCount);
            return (oneSidePicturesCount + data.length) * sidesCount;
        };
        _this.getOriginalIndex = function (item) {
            return _this.props.data.findIndex(function (el) { return el.img === item.img; });
        };
        _this.secureLeftIndex = function (index) {
            return index < 0
                ? _this.props.data.length - 1
                : index;
        };
        _this.secureRightIndex = function (index) {
            return index >= _this.props.data.length
                ? 0
                : index;
        };
        _this.moveStateDiff = function (insecureIndex) {
            var nextState = {
                activeDot: _this.state.activeDot,
                list: _this.state.list
            };
            var direction = insecureIndex < _this.state.activeDot
                ? 'moveLeft'
                : 'moveRight';
            var secureIndex = (direction === 'moveLeft')
                ? _this.secureLeftIndex(insecureIndex)
                : _this.secureRightIndex(insecureIndex);
            while (secureIndex !== nextState.activeDot) {
                if (direction === 'moveLeft') {
                    nextState.activeDot = _this.secureLeftIndex(nextState.activeDot - 1);
                    var first = nextState.list[0];
                    var nextFirst = __assign({}, _this.getOriginalItemByIndex({
                        data: _this.props.data,
                        index: _this.getOriginalIndex(first) - 1
                    }), { id: _this.getId() });
                    nextState.list = [nextFirst].concat(nextState.list.slice(0, -1));
                }
                else {
                    nextState.activeDot = _this.secureRightIndex(nextState.activeDot + 1);
                    var last = nextState.list.slice(-1)[0];
                    nextState.list = nextState.list.slice(1);
                    var nextLast = __assign({}, _this.getOriginalItemByIndex({
                        data: _this.props.data,
                        index: _this.getOriginalIndex(last) + 1
                    }), { id: _this.getId() });
                    nextState.list.push(nextLast);
                }
            }
            return nextState;
        };
        _this.moveLeft = function () {
            return _this.setState(_this.moveStateDiff(_this.state.activeDot - 1));
        };
        _this.moveRight = function () {
            return _this.setState(_this.moveStateDiff(_this.state.activeDot + 1));
        };
        _this.moveToIndexAndRestartInterval = function (insecureIndex) {
            _this.stopInterval();
            _this.setState(_this.moveStateDiff(insecureIndex), _this.startInterval);
        };
        _this.checkIfItemIsActive = function (index) {
            var _a = _this.state, list = _a.list, aroundItemsCount = _a.aroundItemsCount;
            return index >= aroundItemsCount && index < list.length - aroundItemsCount;
        };
        _this.onTouchStart = function (e) {
            _this.stopInterval();
            _this.setState({
                startTouchPosition: parseInt(e.changedTouches[0].screenX, 10)
            });
        };
        _this.onTouchEnd = function (e) {
            _this.startInterval();
            var startTouchPosition = _this.state.startTouchPosition;
            var endTouchPosition = parseInt(e.changedTouches[0].screenX, 10);
            var delta = startTouchPosition - endTouchPosition;
            if (Math.abs(delta) < _this.MINIMUM_SENSITIVE_MOVE)
                return;
            if (delta > 0)
                _this.moveRight();
            if (delta < 0)
                _this.moveLeft();
        };
        _this.stopInterval = function () {
            if (_this.intervalHandlerRef.current)
                _this.intervalHandlerRef.current.stopInterval();
        };
        _this.startInterval = function () {
            if (_this.intervalHandlerRef.current)
                _this.intervalHandlerRef.current.startInterval();
        };
        var size = props.size, data = props.data, shift = props.shift;
        var aroundItemsCount = size;
        _this.state = {
            aroundItemsCount: aroundItemsCount,
            list: _this.initList({ aroundItemsCount: aroundItemsCount, size: size, data: data, shift: shift }),
            activeDot: props.defaultActiveDot != null
                ? props.defaultActiveDot
                : Math.trunc(data.length / 2),
            startTouchPosition: 0
        };
        return _this;
    }
    Carousel.prototype.componentDidMount = function () {
        this.reInitMounted();
    };
    Carousel.prototype.componentDidUpdate = function (prevProps) {
        if (this.shouldReInit(prevProps))
            this.reInitMounted();
    };
    Carousel.prototype.render = function () {
        var _this = this;
        var _a = this.props, size = _a.size, theme = _a.theme, autoSlide = _a.autoSlide;
        var _b = this.state, list = _b.list, aroundItemsCount = _b.aroundItemsCount, activeDot = _b.activeDot;
        var moveBtnStyle = {
            width: 100 / Math.max(size, 2) + "%"
        };
        return (React.createElement("div", { className: theme.carousel, onMouseEnter: this.stopInterval, onMouseLeave: this.startInterval },
            autoSlide && (React.createElement(interval_handler_1.IntervalHandler, { ref: this.intervalHandlerRef, timeout: autoSlide.interval, handler: autoSlide.direction === 'moveLeft'
                    ? this.moveLeft
                    : this.moveRight })),
            React.createElement("div", { className: theme.itemsLine, ref: this.itemsRef },
                React.createElement("div", { className: theme.moveLeft, onClick: this.moveLeft, style: moveBtnStyle }),
                React.createElement("div", { className: theme.middle }, list.map(function (el, i) {
                    var isActive = _this.checkIfItemIsActive(i);
                    var isNeighbour = _this.checkIfItemIsActive(i + 1) ||
                        _this.checkIfItemIsActive(i - 1);
                    var translateLeft = (i - aroundItemsCount) * 100;
                    var marginLeft = -100 / size;
                    if (i === 0)
                        marginLeft = 0;
                    return (React.createElement("div", { key: el.id, className: theme.item + " " + (isActive ? theme.active : '') + " " + (isNeighbour ? theme.neighbour : ''), style: {
                            transform: "translateX(" + translateLeft + "%)",
                            marginLeft: marginLeft + "%",
                            flex: "0 0 " + 100 / size + "%"
                        }, onTouchStart: _this.onTouchStart, onTouchEnd: _this.onTouchEnd },
                        React.createElement("div", { className: theme.imgWrap },
                            el.img,
                            React.createElement("div", { className: theme.caption }, el.caption))));
                })),
                React.createElement("div", { className: theme.moveRight, onClick: this.moveRight, style: moveBtnStyle })),
            React.createElement("div", { className: theme.indicatorsLine }, this.props.data.map(function (_el, index) { return (React.createElement("div", { key: index, className: theme.indicator + " " + (index === activeDot ? theme.currentIndicator : ''), onClick: function () { return _this.moveToIndexAndRestartInterval(index); } })); }))));
    };
    return Carousel;
}(React.Component));
exports.Carousel = Carousel;
