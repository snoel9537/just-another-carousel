import cn from 'classnames'
import * as React from 'react'
import { IntervalHandler } from './interval-handler'

export interface CarouselData {
  img: React.ReactNode
  caption: React.ReactNode
}

type CarouselItem = CarouselData & { id: string }

interface State {
  aroundItemsCount: number
  list: CarouselItem[]
  activeDot: number
  startTouchPosition: number
}

interface OwnProps {
  data: CarouselData[]
  size: number // count of active items
  shift?: number // move initial list
  defaultActiveDot?: number // default is middle dot
  autoSlide?: {
    // slide automatically
    interval: number
    direction: 'moveLeft' | 'moveRight'
  }
  theme: Partial<CarouselTheme>
}

interface CarouselTheme {
  active: string
  caption: string
  carousel: string
  currentIndicator: string
  imgWrap: string
  indicator: string
  indicatorsLine: string
  item: string
  itemsLine: string
  neighbour: string
  middle: string
  moveLeft: string
  moveRight: string
}

type ComponentProps = OwnProps

export class Carousel extends React.Component<ComponentProps, State> {
  private itemsRef = React.createRef<HTMLDivElement>()
  private intervalHandlerRef = React.createRef<IntervalHandler>()
  private MINIMUM_SENSITIVE_MOVE = 30 // px

  constructor(props: ComponentProps) {
    super(props)
    const { size, data, shift } = props
    const aroundItemsCount = 0
    this.state = {
      aroundItemsCount,
      list: this.initList({ aroundItemsCount, size, data, shift }),
      activeDot:
        props.defaultActiveDot != null
          ? props.defaultActiveDot
          : Math.trunc(data.length / 2),
      startTouchPosition: 0
    }
  }

  getId = () =>
    Date.now()
      .toString()
      .slice(-8) +
    Math.random()
      .toString(36)
      .slice(2)

  getOriginalItemByIndex = ({ data, index }: { data: CarouselData[], index: number }) => {
    let realIndex = index % data.length
    if (realIndex < 0) realIndex = data.length + realIndex

    return data[realIndex]
  }

  // generate list with surroundings and repeating
  initList = ({ data, size, aroundItemsCount, shift }: {
    data: CarouselData[]
    size: number
    aroundItemsCount: number
    shift: number | undefined
  }) => {
    let list = []
    for (let i = -aroundItemsCount; i < size + aroundItemsCount; i++) {
      const originalItem = this.getOriginalItemByIndex({ data, index: i })
      list.push({
        ...originalItem,
        id: this.getId()
      })
    }

    if (shift) {
      list = [...list.slice(shift), ...list.slice(0, shift)]
    }

    return list
  }

  componentDidMount() {
    this.reInitMounted()
  }

  componentDidUpdate(prevProps: ComponentProps) {
    if (prevProps.size !== this.props.size) this.reInitMounted()
  }

  reInitMounted = () => {
    const { size, data, shift } = this.props
    if (
      !this.itemsRef.current!.getClientRects()[0] ||
      !window.document.body.getClientRects()[0]
    )
      return

    const activeBlockWidth = this.itemsRef.current!.getClientRects()[0].width
    const bodyWidth = window.document.body.getClientRects()[0].width
    const oneSectionWidth = activeBlockWidth / size

    const aroundItemsCount =
      Math.trunc((bodyWidth - activeBlockWidth) / oneSectionWidth / 2) + 2

    this.setState({
      aroundItemsCount,
      list: this.initList({ aroundItemsCount, size, data, shift })
    })
  }

  getOriginalIndex = (item: CarouselItem) =>
    this.props.data.findIndex(el => el.img === item.img)!

  moveLeftStateDiff = () => {
    const [first] = this.state.list
    const nextFirst = {
      ...this.getOriginalItemByIndex({
        data: this.props.data,
        index: this.getOriginalIndex(first) - 1
      }),
      id: this.getId()
    }
    const nextList = [nextFirst, ...this.state.list.slice(0, -1)]

    return {
      list: nextList,
      activeDot:
        this.state.activeDot === 0
          ? this.props.data.length - 1
          : this.state.activeDot - 1
    }
  }

  moveLeft = () => {
    this.setState(this.moveLeftStateDiff())
  }

  moveLeftAndRestartInterval = () => {
    this.stopInterval()
    this.setState(this.moveLeftStateDiff(), this.startInterval)
  }

  moveRightStateDiff = () => {
    const [last] = this.state.list.slice(-1)
    const nextList = this.state.list.slice(1)
    const nextLast = {
      ...this.getOriginalItemByIndex({
        data: this.props.data,
        index: this.getOriginalIndex(last) + 1
      }),
      id: this.getId()
    }
    nextList.push(nextLast)

    return {
      list: nextList,
      activeDot:
        this.state.activeDot === this.props.data.length - 1
          ? 0
          : this.state.activeDot + 1
    }
  }

  moveRight = () => {
    this.setState(this.moveRightStateDiff())
  }

  moveRightAndRestartInterval = () => {
    this.stopInterval()
    this.setState(this.moveRightStateDiff(), this.startInterval)
  }

  checkIfItemIsActive = (index: number): boolean => {
    const { list, aroundItemsCount } = this.state
    return index >= aroundItemsCount && index < list.length - aroundItemsCount
  }

  onTouchStart = (e: any) => {
    this.stopInterval()
    this.setState({
      startTouchPosition: parseInt(e.changedTouches[0].screenX, 10)
    })
  }

  onTouchEnd = (e: any) => {
    this.startInterval()
    const { startTouchPosition } = this.state
    const endTouchPosition = parseInt(e.changedTouches[0].screenX, 10)
    const delta = startTouchPosition - endTouchPosition

    if (Math.abs(delta) < this.MINIMUM_SENSITIVE_MOVE) return
    if (delta > 0) this.moveRight()
    if (delta < 0) this.moveLeft()
  }

  stopInterval = () => {
    if (this.intervalHandlerRef.current)
      this.intervalHandlerRef.current.stopInterval()
  }

  startInterval = () => {
    if (this.intervalHandlerRef.current)
      this.intervalHandlerRef.current.startInterval()
  }

  render() {
    const { size, theme, autoSlide } = this.props
    const { list, aroundItemsCount, activeDot } = this.state
    const moveBtnStyle = {
      width: `${100 / Math.max(size, 2)}%`
    }

    return (
      <div
        className={theme.carousel}
        onMouseEnter={this.stopInterval}
        onMouseLeave={this.startInterval}
      >
        {autoSlide && (
          <IntervalHandler
            ref={this.intervalHandlerRef}
            timeout={autoSlide.interval}
            handler={
              autoSlide.direction === 'moveLeft'
                ? this.moveLeft
                : this.moveRight
            }
          />
        )}
        <div className={theme.itemsLine} ref={this.itemsRef}>
          <div
            className={theme.moveLeft}
            onClick={this.moveLeft}
            style={moveBtnStyle}
          />

          <div className={theme.middle}>
            {list.map((el, i) => {
              const isActive = this.checkIfItemIsActive(i)
              const isNeighbour =
                this.checkIfItemIsActive(i + 1) ||
                this.checkIfItemIsActive(i - 1)
              const translateLeft = (i - aroundItemsCount) * 100
              let marginLeft = -100 / size
              if (i === 0) marginLeft = 0

              return (
                <div
                  key={el.id}
                  className={cn(theme.item, {
                    [theme.active as any]: isActive,
                    [theme.neighbour as any]: isNeighbour
                  })}
                  style={{
                    transform: `translateX(${translateLeft}%)`,
                    marginLeft: `${marginLeft}%`,
                    flex: `0 0 ${100 / size}%`
                  }}
                  onTouchStart={this.onTouchStart}
                  onTouchEnd={this.onTouchEnd}
                >
                  <div className={theme.imgWrap}>
                    {el.img}
                    <div className={theme.caption}>{el.caption}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            className={theme.moveRight}
            onClick={this.moveRight}
            style={moveBtnStyle}
          />
        </div>
        <div className={theme.indicatorsLine}>
          {this.props.data.map((_el, index) => (
            <div
              key={index}
              className={cn(theme.indicator, {
                [theme.currentIndicator as any]: index === activeDot
              })}
              onClick={() => {
                if (index > activeDot) this.moveRightAndRestartInterval()

                if (index < activeDot) this.moveLeftAndRestartInterval()
              }}
            />
          ))}
        </div>
      </div>
    )
  }
}