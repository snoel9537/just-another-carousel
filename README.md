# Just another carousel

## Installation

```bash
npm install just-another-carousel --save
```

## Usage

[**Examples**](https://github.com/snoel9537/just-another-carousel-example)

```tsx
import { Carousel } from 'just-another-carousel'
import styles from 'just-another-carousel/dist/carousel.module.css'
import React from 'react'
import './App.css'

const App: React.FC = () => (
    <Carousel
      size={3}
      autoSlide={{ interval: 2000, direction: 'moveRight' }}
      data={[
        { caption: <h1>Animals</h1>, img: <img src="https://placeimg.com/640/480/animals" alt="animals"/>},
        { caption: <h1>Arch</h1>, img: <img src="https://placeimg.com/640/480/arch" alt="arch"/>},
        { caption: <h1>Nature</h1>, img: <img src="https://placeimg.com/640/480/nature" alt="nature"/>},
        { caption: <h1>People</h1>, img: <img src="https://placeimg.com/640/480/people" alt="people"/>},
        { caption: <h1>Tech</h1>, img: <img src="https://placeimg.com/640/480/tech" alt="tech"/>}
      ]}
      theme={{
        active: styles['active'],
        caption: styles['caption'],
        carousel: styles['carousel'],
        imgWrap: styles['img-wrap'],
        indicator: styles['indicator'],
        indicatorsLine: styles['indicators-line'],
        item: styles['item'],
        itemsLine: styles['items-line'],
        moveLeft: styles['move-left'],
        moveRight: styles['move-right'],
        currentIndicator: styles['current-indicator'],
        middle: styles['middle'],
        neighbour: styles['neighbour'],
      }}
    />
  )
export default App

```

## License

MIT

#Preview 

![just-another-carousel-demo.gif](https://i.ibb.co/FKLSx7J/just-another-carousel.gif)