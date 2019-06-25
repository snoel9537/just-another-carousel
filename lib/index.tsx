import * as React from 'react'
import { IntervalHandler } from './interval-handler'

export interface CarouselData {
  img: React.ReactNode
  caption?: React.ReactNode
}

type CarouselItem = CarouselData & { id: string }

interface State {
  aroundItemsCount: number
  list: CarouselItem[]
  activeDot: number
  startTouchPosition: number
}

type Direction = 'moveLeft' | 'moveRight'

interface OnMoveDescription {
  direction: Direction
  prevIndex: number
  currentIndex: number
}

interface OwnProps {
  data: CarouselData[]
  size: number // count of active items
  shift?: number // move initial list
  defaultActiveDot?: number // default is middle dot
  autoSlide?: {
    // slide automatically
    interval: number
    direction: Direction
  }
  theme: Partial<CarouselTheme>
  onMove?: (description: OnMoveDescription) => any
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

interface MoveStateDiff {
  nextState: Pick<State, 'list' | 'activeDot'>
  direction: Direction
}

interface InitListArg {
  data: CarouselData[]
  size: number
  aroundItemsCount: number
  shift: number | undefined
}

interface GetOriginalItemByIndexArg {
  data: CarouselData[]
  index: number
}

export class Carousel extends React.Component<ComponentProps, State> {
  private itemsRef = React.createRef<HTMLDivElement>()
  private intervalHandlerRef = React.createRef<IntervalHandler>()
  private MINIMUM_SENSITIVE_MOVE = 30 // px

  constructor(props: ComponentProps) {
    super(props)
    const { size, data, shift } = props
    const aroundItemsCount = size
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
    Date.now().toString().slice(-8) +
    Math.random().toString(36).slice(2)

  getOriginalItemByIndex = ({ data, index }: GetOriginalItemByIndexArg) => {
    let realIndex = index % data.length
    if (realIndex < 0) realIndex = data.length + realIndex

    return data[realIndex]
  }

  // generate list with surroundings and repeating
  initList = ({ data, size, aroundItemsCount, shift }: InitListArg) => {
    let list = []

    for (let i = -aroundItemsCount; i < size + aroundItemsCount; i++) {
      const originalItem = this.getOriginalItemByIndex({ data, index: i })
      list.push({
        ...originalItem,
        id: this.getId()
      })
    }

    if (shift)
      list = [...list.slice(shift), ...list.slice(0, shift)]

    return list
  }

  componentDidMount() {
    this.reInitMounted()
  }

  componentDidUpdate(prevProps: ComponentProps) {
    if (this.shouldReInit(prevProps))
      this.reInitMounted()
  }

  shouldReInit = (prevProps: ComponentProps) => {
    const sizeChanged = prevProps.size !== this.props.size
    const lengthChanged = prevProps.data.length !== this.props.data.length
    return sizeChanged || lengthChanged
  }

  reInitMounted = () => {
    const { size, data, shift } = this.props
    if (!this.hasItemsRefWidth())
      return

    const aroundItemsCount = this.calculateAroundItemsCount()
    this.setState({
      aroundItemsCount,
      list: this.initList({ aroundItemsCount, size, data, shift })
    })
  }

  hasItemsRefWidth = () =>
    this.itemsRef.current!.getClientRects()[0] &&
    window.document.body.getClientRects()[0]

  calculateAroundItemsCount = (): number => {
    const { size, data } = this.props
    const activeBlockWidth = this.itemsRef.current!.getClientRects()[0].width
    const bodyWidth = window.document.body.getClientRects()[0].width
    const oneSectionWidth = activeBlockWidth / size
    const sidesCount = 2
    const leftSideAndRightSideWidth = bodyWidth - activeBlockWidth
    const oneSidePicturesCount = Math.ceil(leftSideAndRightSideWidth / oneSectionWidth / sidesCount)
    return (oneSidePicturesCount + data.length) * sidesCount
  }

  getOriginalIndex = (item: CarouselItem) =>
    this.props.data.findIndex(el => el.img === item.img)

  secureLeftIndex = (index: number): number =>
    index < 0
      ? this.props.data.length - 1
      : index

  secureRightIndex = (index: number): number =>
    index >= this.props.data.length
      ? 0
      : index

  moveStateDiff = (insecureIndex: number): MoveStateDiff => {
    const nextState: MoveStateDiff['nextState'] = {
      activeDot: this.state.activeDot,
      list: this.state.list
    }

    const direction: Direction = insecureIndex < this.state.activeDot
      ? 'moveLeft'
      : 'moveRight'

    const secureIndex = (direction === 'moveLeft')
      ? this.secureLeftIndex(insecureIndex)
      : this.secureRightIndex(insecureIndex)

    while (secureIndex !== nextState.activeDot) {
      if (direction === 'moveLeft') {
        nextState.activeDot = this.secureLeftIndex(nextState.activeDot - 1)

        const [first] = nextState.list
        const nextFirst = {
          ...this.getOriginalItemByIndex({
            data: this.props.data,
            index: this.getOriginalIndex(first) - 1
          }),
          id: this.getId()
        }
        nextState.list = [nextFirst, ...nextState.list.slice(0, -1)]
      } else {
        nextState.activeDot = this.secureRightIndex(nextState.activeDot + 1)

        const [last] = nextState.list.slice(-1)
        nextState.list = nextState.list.slice(1)
        const nextLast = {
          ...this.getOriginalItemByIndex({
            data: this.props.data,
            index: this.getOriginalIndex(last) + 1
          }),
          id: this.getId()
        }
        nextState.list.push(nextLast)
      }
    }

    return {
      nextState,
      direction
    }
  }

  moveLeft = () =>
    this.moveAndCallback(this.moveStateDiff(this.state.activeDot - 1))

  moveRight = () =>
    this.moveAndCallback(this.moveStateDiff(this.state.activeDot + 1))

  moveToIndexAndRestartInterval = (insecureIndex: number) => {
    this.stopInterval()
    this.moveAndCallback(this.moveStateDiff(insecureIndex), this.startInterval)
  }

  moveAndCallback = ({ nextState, direction }: MoveStateDiff, setStateCallback?: (() => void)) => {
    const prevIndex = this.state.activeDot

    this.setState(nextState, () => {
      if (setStateCallback) {
        setStateCallback()
      }
    })

    if (this.props.onMove) {
      this.props.onMove({
        currentIndex: nextState.activeDot,
        prevIndex,
        direction
      })
    }
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
                  className={`${theme.item} ${isActive ? theme.active : ''} ${isNeighbour ? theme.neighbour : ''}`}
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
              className={`${theme.indicator} ${index === activeDot ? theme.currentIndicator : ''}`}
              onClick={() => this.moveToIndexAndRestartInterval(index)}
            />
          ))}
        </div>
      </div>
    )
  }
}