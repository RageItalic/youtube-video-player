

function DurationAndProgressBar({videoRef, durationBarRef, seekOrbRef, chapterRefs, chapters, seekOrbRefPosition, setShowChapterCard, renderChapterCard, duration, handleDurationBarDrag, handleDurationBarClick, handleControlBarHoverToggle}) {
  return (
    <>
      {/* progress bars & seek orb */}
      <div 
        ref={durationBarRef}
        style={{width: "100%", height: "4px", backgroundColor: videoRef.current?.paused === true && videoRef.current?.currentTime === 0 ? "#a9a9a9" : "white",}} 
        onClick={handleDurationBarClick} 
        onMouseMove={handleDurationBarDrag} 
        onMouseOver={() => handleControlBarHoverToggle(true, false)} 
        onMouseOut={() => handleControlBarHoverToggle(false, true)}
      >
          {/* seek orb */}
        <div ref={seekOrbRef} style={{width: "13px", height: "13px", borderRadius: "50%", backgroundColor: "white", border: "1px solid black", position: "relative", top: "-6.5px", left: seekOrbRefPosition - 6.5, zIndex: 1}}></div>
        
        {/* chapters */}
        <div style={{display: "flex", flexDirection: "row", gap: "1px"}}>
          {chapters.map((chapter, idx) => {
            return (
              <div 
                key={idx}
                ref={chapterRefs.current[idx]}
                onMouseOut={() => setShowChapterCard(false)}
                onMouseMove={(e) => renderChapterCard(e, chapter)}
                style={{
                  width: `${((chapter.end - chapter.start) / (Number(duration.split(":")[0])*60 + Number(duration.split(":")[1])))*101}%`,
                  height: "4px",
                  position: "relative",
                  top: "-15px",
                }}
              ></div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default DurationAndProgressBar