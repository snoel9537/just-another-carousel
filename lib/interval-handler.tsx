import * as React from 'react'
import TrackScrollVisibility from 'react-on-screen'

interface IntervalHandlerProps {
  handler: () => void
  timeout: number
}

interface IntervalHandlerInnerProps extends IntervalHandlerProps {
  isInViewport: boolean
}

// IntervalHandler executes props.handler each props.timeout tick.
// It pauses if child element is not fully in viewport.
// It pauses if tab lost focus.
export class IntervalHandler extends React.Component<IntervalHandlerProps> {
  private handler = React.createRef<IntervalHandlerInner>()
  public startInterval = () => this.handler.current!.startInterval()
  public stopInterval = () => this.handler.current!.stopInterval()

  render() {
    return (
      <TrackScrollVisibility>
        {({ isVisible }) => (
          <IntervalHandlerInner
            ref={this.handler}
            {...this.props}
            isInViewport={isVisible}
          />
        )}
      </TrackScrollVisibility>
    )
  }
}

class IntervalHandlerInner extends React.Component<IntervalHandlerInnerProps> {
  private interval: any
  private wasSetBeforeTabLeaving: boolean | undefined

  componentDidUpdate(prevProps: IntervalHandlerInnerProps) {
    if (prevProps.isInViewport !== this.props.isInViewport) {
      if (this.props.isInViewport) {
        this.startInterval()
      } else {
        this.stopInterval()
      }
    }
  }

  componentDidMount() {
    if (this.props.isInViewport) this.startInterval()

    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  componentWillUnmount() {
    if (this.props.isInViewport) this.stopInterval()

    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  }

  render() {
    return <span />
  }

  startInterval = () => {
    if (this.isSet()) this.stopInterval()

    this.interval = setInterval(() => {
      this.props.handler()
    }, this.props.timeout)
  }

  stopInterval = () => {
    if (!this.isSet()) {
      return
    }

    clearInterval(this.interval)
    this.interval = undefined
  }

  private isSet = () => this.interval !== undefined

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.wasSetBeforeTabLeaving = this.isSet()
      this.stopInterval()
    } else {
      if (this.wasSetBeforeTabLeaving) this.startInterval()
    }
  }
}
