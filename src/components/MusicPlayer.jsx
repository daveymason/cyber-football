import { useEffect, useRef, useState, useCallback } from "react";

// List your music tracks here. Make sure the filenames match those in public/music/
const musicTracks = [
  { src: "/music/cyberpunk-metaverse.mp3", title: "Cyberpunk Metaverse", artist: "Mykola Odnoroh", isMain: true },
  { src: "/music/futuristic-city-1.mp3", title: "Futuristic City 1", artist: "Ievgen Poltavskyi" },
  { src: "/music/futuristic-city-2.mp3", title: "Futuristic City 2", artist: "Ievgen Poltavskyi" },
  { src: "/music/cyberpunk-electrohouse.mp3", title: "Cyberpunk Electrohouse", artist: "u_98o9hlkn7r" },
  { src: "/music/inspirational-future.mp3", title: "Inspirational Future Music", artist: "Rigel_Vega" },
  { src: "/music/electropower.mp3", title: "Electropower", artist: "Tony Vodnik" },
  { src: "/music/password-infinity.mp3", title: "Password Infinity", artist: "Evgeny_Bardyuzha" },
  { src: "/music/cyberpunk-gaming.mp3", title: "Cyberpunk Gaming", artist: "dopestuff" },
];

// Helper to shuffle array
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

function MusicPlayer({ volume = 70 }) {
  const audioRef = useRef(null);
  
  // Initialize playlist with shuffled indices, ensuring Main is first
  const [playlist, setPlaylist] = useState(() => {
    const indices = musicTracks.map((_, i) => i);
    const shuffled = shuffleArray(indices);
    const mainIndex = musicTracks.findIndex(t => t.isMain);
    if (mainIndex !== -1) {
      const idx = shuffled.indexOf(mainIndex);
      if (idx !== -1) {
        shuffled.splice(idx, 1);
        shuffled.unshift(mainIndex);
      }
    }
    return shuffled;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const currentTrack = musicTracks[playlist[currentIndex]];

  // Update volume whenever prop changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleEnded = useCallback(() => {
    if (currentIndex + 1 >= playlist.length) {
      // Re-shuffle and restart
      const indices = musicTracks.map((_, i) => i);
      const newShuffled = shuffleArray(indices);
      setPlaylist(newShuffled);
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.src = currentTrack.src;
    audio.volume = volume / 100;
    
    const playAudio = async () => {
      try {
        await audio.play();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      } catch (error) {
        console.log("Autoplay prevented. Waiting for user interaction...", error);
        // Add one-time listener to start audio on first interaction
        const handleInteraction = () => {
          audio.play().then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
          }).catch(e => console.error("Play failed after interaction:", e));
          
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('keydown', handleInteraction);
        };
        
        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);
      }
    };

    playAudio();

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, handleEnded]); // volume excluded to prevent restart

  return (
    <>
      <audio ref={audioRef} />
      {showToast && (
        <div className="music-toast">
          <div className="toast-label">Now Playing</div>
          <div className="toast-title">{currentTrack.title}</div>
          <div className="toast-artist">by {currentTrack.artist}</div>
        </div>
      )}
    </>
  );
}

export default MusicPlayer;
