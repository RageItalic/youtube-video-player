import { createRef, useCallback, useEffect, useRef, useState } from 'react'
import Controls from './components/controls'
import DurationAndProgressBar from './components/DurationAndProgressBar'
const videoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

function App() {
  const [chapters, setChapters] = useState([
    {title: "Start", start: 0, end: 55},
    {title: "Middle", start: 56, end: 312},
    {title: "Climax", start: 313, end: 490},
    {title: "Credits", start: 491, end: 580},
    {title: "Post Credits Scene", start: 580, end: 596}
  ])
  const [screenshotsAvailable, setScreenshotsAvailable] = useState({})
  const [showChapterCard, setShowChapterCard] = useState(false)
  const [requestedScreenshot, setRequestedScreenshot] = useState([])

  const [currentChapterCard, setCurrentChapterCard] = useState(null)
  const [showVideoControls, setShowVideoControls] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [duration, setDuration] = useState("00:00")
  const [seekOrbRefPosition, setSeekOrbRefPosition] = useState(0)
  const fullScreenRef = useRef(null)
  const videoRef = useRef(null)
  const durationBarRef = useRef(null)
  const seekOrbRef = useRef(null)
  const chapterRefs = useRef([])

  useEffect(() => {
    //creating a ref for each chapter bar
    chapterRefs.current = chapters.map((_, i) => chapterRefs.current[i] ?? createRef())
  }, [chapters])

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
        setPlaying(true)
      } else {
        videoRef.current.pause()
        setPlaying(false)
      }
    }
  }, [])

  const handleDurationChange = () => {
    const totalTimeInSeconds = videoRef.current.duration

    if (totalTimeInSeconds < 3600) {
      setDuration(new Date(totalTimeInSeconds * 1000).toISOString().substring(14, 19))
    } else {
      setDuration(new Date(totalTimeInSeconds * 1000).toISOString().substring(11, 19))
    }
  }

  const handleCurrentTimeChange = () => {
    const timeElapsed = videoRef.current.currentTime
    const totalTimeInSeconds = videoRef.current.duration
    const timeInPercent = (timeElapsed/totalTimeInSeconds) * 100
    const seekOrbPosition = (timeInPercent/100) * durationBarRef.current.offsetWidth
    const bufferedTill = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
    const bufferedTillInPercent = (bufferedTill/totalTimeInSeconds) * 100

    // console.log("hello", bufferedTill - timeElapsed)
    
    // setBufferBarWidth(`${bufferedTillInPercent}%`)
    setSeekOrbRefPosition(seekOrbPosition)

    if (totalTimeInSeconds < 3600) {
      setCurrentTime(new Date(timeElapsed * 1000).toISOString().substring(14, 19))
    } else {
      setCurrentTime(new Date(timeElapsed * 1000).toISOString().substring(11, 19))
    }

    const findPrevChaptersLength = (currentChapterIdx) => {
      if (currentChapterIdx === 0) return 0

      let chaptersLength = 0
      for (let i = 0; i < currentChapterIdx; i++) {
        chaptersLength += chapters[i].end - chapters[i].start
      }
      return chaptersLength
    }

    //red vs grey calculator on chapters
    chapters.forEach((chapter, idx) => {
      let thisChapter = chapterRefs.current[idx]
      if (timeElapsed <= chapter.start) {
        //full grey
        thisChapter.current.style.background = `linear-gradient(to right, red 0% ${0}%, #a9a9a9 ${0}% 100%)`
      } else if (timeElapsed > chapter.start && timeElapsed < chapter.end) {
        //calculate part red part grey
        const chapterLength = chapter.end - chapter.start
        const prevChaptersLength = findPrevChaptersLength(idx) //chapters[idx-1] !== undefined ? chapters[idx-1].end - chapters[idx-1].start : 0 
        const timeElapsedOnChapterInPercent = ((timeElapsed - prevChaptersLength)/chapterLength)*100
        const bufferedAheadOnChapter = bufferedTill - timeElapsed
        const bufferedAheadOnChapterInPercent = (bufferedAheadOnChapter / chapterLength) * 100
        thisChapter.current.style.background = `linear-gradient(to right, red 0% ${timeElapsedOnChapterInPercent}%, #d3d3d3  ${timeElapsedOnChapterInPercent}% ${timeElapsedOnChapterInPercent + bufferedAheadOnChapterInPercent}%, #a9a9a9 ${timeElapsedOnChapterInPercent}% 100%)`
      } else {
        //full red
        thisChapter.current.style.background = `linear-gradient(to right, red 0% ${100}%, #a9a9a9 ${100}% 100%)`
      }
    })

  }

  const handleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      fullScreenRef.current.requestFullscreen()
      videoRef.current.style.width = "100%"
      durationBarRef.current.parentElement.style.width = "100vw"
    } else {
      document.exitFullscreen()
      videoRef.current.style.width = "50%"
      durationBarRef.current.parentElement.style.width = "50%"
    }
  }, [])

  const handleDurationBarClick = useCallback((e) => {
    const durationBarDimesions = durationBarRef.current.getBoundingClientRect()
    const positionClicked = durationBarDimesions.right - e.clientX
    const durationBarWidth = durationBarDimesions.width
    const amtOfTimeElapsedInPixels = 100 - ((positionClicked / durationBarWidth)*100)
    const timeElapsed = (amtOfTimeElapsedInPixels/100) * videoRef.current.duration
    console.log(amtOfTimeElapsedInPixels, timeElapsed)
    videoRef.current.currentTime = timeElapsed
    setCurrentTime(new Date(timeElapsed).toISOString().substring(14, 19))
  }, [])

  const handleDurationBarDrag = useCallback((e) => {
    if (e.buttons === 1) {
      handleDurationBarClick(e)
    }
  }, [])

  const handleControlBarHoverToggle = useCallback((mouseOver, mouseOut) => {
    if (mouseOver) {
      durationBarRef.current.style.height = "8px"
      chapterRefs.current.forEach(chapterRef => {
        chapterRef.current.style.height = "8px"
        chapterRef.current.style.top = "-15px"
      })
    }
    if (mouseOut) {
      durationBarRef.current.style.height = "4px"
      chapterRefs.current.forEach(chapterRef => {
        chapterRef.current.style.height = "4px"
        chapterRef.current.style.top = "-15px"
      })
    }
  }, [])

  const handleShowVideoControls = (e) => {
    let timer;
    setShowVideoControls(true)
    clearTimeout(timer)
    timer = setTimeout(() => setShowVideoControls(false), 3000)
  }

  const renderChapterCard = useCallback(async (e, chapter) => {
    const durationBarDimesions = durationBarRef.current.getBoundingClientRect()
    const positionClicked = durationBarDimesions.right - e.clientX
    const durationBarWidth = durationBarDimesions.width
    const framePositionRequestedInPixels = 100 - ((positionClicked / durationBarWidth)*100)
    let framePositionRequestedInSeconds = Math.floor((framePositionRequestedInPixels/100) * videoRef.current.duration)
    console.log("rendering", framePositionRequestedInSeconds)

    //calculating which timestamp use for screenshot
    if (framePositionRequestedInSeconds < 0) framePositionRequestedInSeconds = 0 // --> this line ensures there is no undefined timestamp which causes backend to crash
    const lastDigit = framePositionRequestedInSeconds % 10
    let timeStampForScreenshot;
    if (lastDigit >= 0 && lastDigit <= 4) {
      timeStampForScreenshot = framePositionRequestedInSeconds - lastDigit
    } else if (lastDigit > 4 && lastDigit < 8) {
      timeStampForScreenshot = framePositionRequestedInSeconds - lastDigit + 5
    } else if (lastDigit >= 8) {
      timeStampForScreenshot = framePositionRequestedInSeconds - lastDigit + 10
    }

    if (screenshotsAvailable[timeStampForScreenshot] === undefined) {
      console.log("the screenshot at time", timeStampForScreenshot, " is not available. Making request now.")
      const response = await fetch(`http://localhost:3089/screenshot?timestamp=${timeStampForScreenshot}`)
      const json = await response.json()
      console.log('set in state/localstorage NOW!')

      setScreenshotsAvailable(prevState => {
        const newState = {
          ...prevState,
          [timeStampForScreenshot]: json.screenshotB64
        }
        return newState
      })
      setRequestedScreenshot(json.screenshotB64)
    } else {
      setRequestedScreenshot(screenshotsAvailable[timeStampForScreenshot])
    }

    setCurrentChapterCard({
      chapter, 
      mouseX: e.clientX, 
      mouseY: e.clientY
    })
    setShowChapterCard(true)
  }, [screenshotsAvailable, requestedScreenshot, currentChapterCard, showChapterCard])

  return (
    <div ref={fullScreenRef} style={{ background: "white", width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
      {/* video component */}
      <video 
        ref={videoRef}
        width={"50%"}
        onDurationChange={handleDurationChange}
        onTimeUpdate={handleCurrentTimeChange}
        onClick={handlePlayPause}
        onDoubleClick={handleFullScreen}
        src={videoUrl}
      />

      {/* chapter card */}
      {showChapterCard && (
        <>
          <img src={`data:image/png;base64,${requestedScreenshot}`} style={{border: "1px solid white", borderRadius: "7px", position: "absolute", top: currentChapterCard.mouseY - 150, left: currentChapterCard.mouseX - 80}} />
          <div style={{top: currentChapterCard.mouseY - 50, position: "absolute", left: currentChapterCard.mouseX - 30, padding: "10px", color: "white"}}>
            {currentChapterCard.chapter.title}
          </div>
        </>
      )}
      
      <div style={{display: "flex", flexDirection: "column", width: "50%", visibility: showVideoControls ? "visible" : "hidden"}}>
        
        {/* progress bars & seek orb */}
        <DurationAndProgressBar 
          chapters={chapters} 
          duration={duration} 
          durationBarRef={durationBarRef} 
          renderChapterCard={renderChapterCard} 
          seekOrbRef={seekOrbRef} 
          seekOrbRefPosition={seekOrbRefPosition} 
          setShowChapterCard={setShowChapterCard} 
          videoRef={videoRef} 
          chapterRefs={chapterRefs} 
          handleDurationBarClick={handleDurationBarClick}
          handleDurationBarDrag={handleDurationBarDrag}
          handleControlBarHoverToggle={handleControlBarHoverToggle}
        />
        
        {/* controls */}
        <Controls 
          playing={playing} 
          volume={volume} 
          videoRef={videoRef} 
          handleFullScreen={handleFullScreen} 
          handlePlayPause={handlePlayPause}
          currentTime={currentTime}
          duration={duration}
          setVolume={setVolume}
        />
      </div>

    </div>
  )
}

export default App
