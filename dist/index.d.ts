import * as React from 'react';
import { Component, ReactNode } from 'react';
export interface CarouselData {
    img: ReactNode;
    caption?: ReactNode;
}
declare type CarouselItem = CarouselData & {
    id: string;
};
interface State {
    aroundItemsCount: number;
    list: CarouselItem[];
    activeDot: number;
    startTouchPosition: number;
}
declare type Direction = 'moveLeft' | 'moveRight';
interface OnMoveDescription {
    direction: Direction;
    prevIndex: number;
    currentIndex: number;
}
interface OwnProps {
    data: CarouselData[];
    size: number;
    shift?: number;
    defaultActiveDot?: number;
    defaultAroundItemsCount?: number;
    autoSlide?: {
        interval: number;
        direction: Direction;
    };
    theme: Partial<CarouselTheme>;
    onMove?: (description: OnMoveDescription) => any;
}
interface CarouselTheme {
    active: string;
    caption: string;
    carousel: string;
    currentIndicator: string;
    imgWrap: string;
    indicator: string;
    indicatorsLine: string;
    item: string;
    itemsLine: string;
    neighbour: string;
    middle: string;
    moveLeft: string;
    moveRight: string;
}
declare type ComponentProps = OwnProps;
interface MoveStateDiff {
    nextState: Pick<State, 'list' | 'activeDot'>;
    direction: Direction;
}
interface InitListArg {
    data: CarouselData[];
    size: number;
    aroundItemsCount: number;
    shift: number | undefined;
}
interface GetOriginalItemByIndexArg {
    data: CarouselData[];
    index: number;
}
export declare class Carousel extends Component<ComponentProps, State> {
    private itemsRef;
    private intervalHandlerRef;
    private MINIMUM_SENSITIVE_MOVE;
    constructor(props: ComponentProps);
    getId: () => string;
    getOriginalItemByIndex: ({ data, index }: GetOriginalItemByIndexArg) => CarouselData;
    initList: ({ data, size, aroundItemsCount, shift }: InitListArg) => {
        id: string;
        img: React.ReactNode;
        caption?: React.ReactNode;
    }[];
    componentDidMount(): void;
    componentDidUpdate(prevProps: ComponentProps): void;
    shouldReInit: (prevProps: OwnProps) => boolean;
    reInitMounted: () => void;
    hasItemsRefWidth: () => ClientRect;
    calculateAroundItemsCount: () => number;
    getOriginalIndex: (item: CarouselItem) => number;
    secureLeftIndex: (index: number) => number;
    secureRightIndex: (index: number) => number;
    moveStateDiff: (insecureIndex: number) => MoveStateDiff;
    moveLeft: () => void;
    moveRight: () => void;
    moveToIndexAndRestartInterval: (insecureIndex: number) => void;
    moveAndCallback: ({ nextState, direction }: MoveStateDiff, setStateCallback?: (() => void) | undefined) => void;
    checkIfItemIsActive: (index: number) => boolean;
    onTouchStart: (e: any) => void;
    onTouchEnd: (e: any) => void;
    stopInterval: () => void;
    startInterval: () => void;
    render(): JSX.Element;
}
export {};
