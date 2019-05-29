import * as React from 'react';
interface IntervalHandlerProps {
    handler: () => void;
    timeout: number;
}
export declare class IntervalHandler extends React.Component<IntervalHandlerProps> {
    private handler;
    startInterval: () => void;
    stopInterval: () => void;
    render(): JSX.Element;
}
export {};
