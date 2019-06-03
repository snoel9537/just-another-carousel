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
interface OwnProps {
    data: CarouselData[];
    size: number;
    shift?: number;
    defaultActiveDot?: number;
    autoSlide?: {
        interval: number;
        direction: 'moveLeft' | 'moveRight';
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
export declare class Carousel extends React.Component<ComponentProps, State> {
    private itemsRef;
    private intervalHandlerRef;
    private MINIMUM_SENSITIVE_MOVE;
    constructor(props: ComponentProps);
    getId: () => string;
    getOriginalItemByIndex: ({ data, index }: {
        data: CarouselData[];
        index: number;
    }) => CarouselData;
    initList: ({ data, size, aroundItemsCount, shift }: {
        data: CarouselData[];
        size: number;
        aroundItemsCount: number;
        shift: number | undefined;
    }) => {
        id: string;
        img: React.ReactNode;
        caption?: React.ReactNode;
    }[];
    componentDidMount(): void;
    componentDidUpdate(prevProps: ComponentProps): void;
    reInitMounted: () => void;
    getOriginalIndex: (item: CarouselItem) => number;
    moveLeftStateDiff: () => {
        list: CarouselItem[];
        activeDot: number;
    };
    moveLeft: () => void;
    moveLeftAndRestartInterval: () => void;
    moveRightStateDiff: () => {
        list: CarouselItem[];
        activeDot: number;
    };
    moveRight: () => void;
    moveRightAndRestartInterval: () => void;
    checkIfItemIsActive: (index: number) => boolean;
    onTouchStart: (e: any) => void;
    onTouchEnd: (e: any) => void;
    stopInterval: () => void;
    startInterval: () => void;
    render(): JSX.Element;
}
export {};
