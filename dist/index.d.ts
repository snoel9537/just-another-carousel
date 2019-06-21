import * as React from 'react';
export interface CarouselData {
    img: React.ReactNode;
    caption?: React.ReactNode;
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
interface OwnProps {
    data: CarouselData[];
    size: number;
    shift?: number;
    defaultActiveDot?: number;
    autoSlide?: {
        interval: number;
        direction: Direction;
    };
    theme: Partial<CarouselTheme>;
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
export declare class Carousel extends React.Component<ComponentProps, State> {
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
    moveStateDiff: (insecureIndex: number) => Pick<State, "list" | "activeDot">;
    moveLeft: () => void;
    moveRight: () => void;
    moveToIndexAndRestartInterval: (insecureIndex: number) => void;
    checkIfItemIsActive: (index: number) => boolean;
    onTouchStart: (e: any) => void;
    onTouchEnd: (e: any) => void;
    stopInterval: () => void;
    startInterval: () => void;
    render(): JSX.Element;
}
export {};
