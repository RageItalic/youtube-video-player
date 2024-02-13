

export default function Controls({videoRef, handlePlayPause, handleFullScreen, playing, volume, setVolume, currentTime, duration}) {

  const handleVolumeChange = () => {
    if (videoRef.current) {
      if (videoRef.current.volume === 1) {
        videoRef.current.volume = 0
        setVolume(0)
      } else if (videoRef.current.volume === 0) {
        videoRef.current.volume = 0.5
        setVolume(0.5)
      } else if (videoRef.current.volume === 0.5) {
        videoRef.current.volume = 1
        setVolume(1)
      }
    }
  }

  return (
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "0px"}}>
      {/* left controls */}
      <div style={{display: "flex", flexDirection: "row", gap: "10px", alignItems: "center"}}>
        <div onClick={handlePlayPause}>
          { playing 
            ? <i className="fa fa-pause" style={{fontSize: "25px", color: "black"}}></i>
            : <i className="fa fa-play" style={{fontSize: "25px", color: "black"}}></i>
          }
        </div>
        <div onClick={handleVolumeChange}>
          {volume === 1 && <i className="fa fa-volume-up" style={{fontSize: "25px", color: "black"}}></i>}
          {volume === 0.5 && <i className="fa fa-volume-down" style={{fontSize: "25px", color: "black"}}></i>}
          {volume === 0 && <i className="fa fa-volume-off" style={{fontSize: "25px", color: "black"}}></i>}
        </div>
        <div>
          <p style={{color: "black"}}>{currentTime} / {duration}</p>
        </div>
      </div>

      {/* right controls */}
      <div onClick={handleFullScreen}>
        <i className="fa fa-window-maximize" style={{fontSize: "25px", color: "black"}}></i>
      </div>
    </div>
  )
}