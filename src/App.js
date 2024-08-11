import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [word, setWord] = useState('');
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    if (entry && entry.hwi && entry.hwi.prs && entry.hwi.prs.length > 0) {
      entry.hwi.prs.forEach((pr) => {
        if (pr.sound && pr.sound.audio) {
          const audioId = `audio-${pr.sound.audio}`;
          if (audioRef.current && currentAudioId === audioId) {
            audioRef.current.src = `https://media.merriam-webster.com/soundc11/${pr.sound.audio.charAt(0)}/${pr.sound.audio}.wav`;
            audioRef.current.volume = 1; // Set the volume to high

            // Reset the audio when it ends
            audioRef.current.onended = () => {
              setIsPlaying(false);
              setCurrentAudioId(null);
            };
          }
        }
      });
    }
  }, [entry, currentAudioId]);

  const fetchDefinition = async () => {
    try {
      const response = await axios.get(
        `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=0f96e845-c054-4dc1-beac-d91011e07c07`
      );

      if (response.data.length > 0 && typeof response.data[0] === 'object') {
        setEntry(response.data[0]);
        setError('');
      } else {
        setEntry(null);
        setError('Word not found.');
      }
    } catch (err) {
      setEntry(null);
      setError('Error fetching data.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim() === '') {
      setError('Please enter a word.');
      setEntry(null);
      return;
    }
    fetchDefinition();
  };

  const handlePlayPause = (audioId) => {
    if (audioRef.current) {
      if (isPlaying && currentAudioId === audioId) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.src !== `https://media.merriam-webster.com/soundc11/${audioId.charAt(6)}/${audioId.substring(6)}.wav`) {
          audioRef.current.pause();
          audioRef.current.src = `https://media.merriam-webster.com/soundc11/${audioId.charAt(6)}/${audioId.substring(6)}.wav`;
          audioRef.current.load(); // Load the new audio source
        }
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setCurrentAudioId(audioId);
        }).catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };

  const cleanText = (text) => text.replace(/\*/g, '');

  const playIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-10 h-10"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M14.752 11.168l-5.668 3.259A1 1 0 018 13.518V6.482a1 1 0 011.084-.91l5.668 3.259a1 1 0 010 1.82z"
      />
    </svg>
  );

  const pauseIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-10 h-10"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 9v6m4-6v6"
      />
    </svg>
  );

  return (
    <div
      className="bg-cover bg-center min-h-screen p-6 flex flex-col items-center"
      style={{
        backgroundImage:
          "url('https://www.vectornator.io/blog/content/images/size/w1000/2022/03/image-52.png')",
      }}
    >
      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-8 max-w-lg w-full border-2 shadow-lg hover:2xl text-white mb-6">
        <h1 className="text-4xl mb-4 text-center font-bold">Dictionary App</h1>
        <form onSubmit={handleSubmit} className="mb-4 flex justify-center">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word"
            className="border p-2 rounded bg-white bg-opacity-20 focus:ring-pink-90 text-black w-full"
          />
          <button
            type="submit"
            className="ml-2 p-2 bg-pink-900 text-white rounded 0 hover:bg-pink-500 transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 18a8 8 0 100-16 8 8 0 000 16zm6.32-1.61l5.38 5.38" />
            </svg>
          </button>
        </form>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>

      {entry && (
        <div className="w-full max-w-4xl">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border-2 mb-6 shadow-lg hover:shadow-2xl transition duration-500 ">
            <h2 className="text-2xl mb-2 font-bold">
              {entry.hwi && entry.hwi.hw ? cleanText(entry.hwi.hw) : word.toLowerCase()}
            </h2>
            {entry.fl && (
              <p className="mb-2">
                <strong>Part of Speech:</strong> {entry.fl}
              </p>
            )}

            {entry.hwi && entry.hwi.prs && entry.hwi.prs.length > 0 && (
              <div className="mb-2">
                <strong>Pronunciations:</strong>
                <ul className="list-disc list-inside">
                  {entry.hwi.prs.map((pr, idx) => (
                    <li key={idx} className='flex flex-row items-center'>
                      {pr.mw}
                      {pr.sound && pr.sound.audio && (
                        <div className=" ml-2">

                          <button
                            onClick={() => handlePlayPause(`audio-${pr.sound.audio}`)}
                            className="bg-transparent text-white p-4 m-2  rounded flex items-center justify-center"
                          >
                            {isPlaying && currentAudioId === `audio-${pr.sound.audio}` ? pauseIcon : playIcon}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {entry.shortdef && entry.shortdef.length > 0 && (
              <div className="mb-2">
                <strong>Definitions:</strong>
                <ul className="list-disc list-inside">
                  {entry.shortdef.slice(0, 1).map((def, idx) => (
                    <li key={idx}>{def}</li>
                  ))}
                </ul>
              </div>
            )}

            {entry.et && entry.et.length > 0 && (
              <div className="mb-2">
                <strong>Etymology:</strong>
                <ul className="list-disc list-inside">
                  <li>
                    {entry.et[0][1]
                      .replace(/{[^}]+}/g, '')
                      .replace(/\s+/g, ' ')
                      .trim()}
                  </li>
                </ul>
              </div>
            )}

            {entry.ins && entry.ins.length > 0 && (
              <div className="mb-2">
                <strong>Inflected Forms:</strong>
                <ul className="list-disc list-inside">
                  <li>
                    {entry.ins[0].il && <span>{entry.ins[0].il}: </span>}
                    {cleanText(entry.ins[0].if)}
                  </li>
                </ul>
              </div>
            )}

            {entry.date && (
              <p className="mb-2">
                <strong>First Known Use:</strong> {entry.date}
              </p>
            )}

            {entry.meta && entry.meta.offensive !== undefined && (
              <p className="mb-2">
                <strong>Offensive:</strong> {entry.meta.offensive ? 'Yes' : 'No'}
              </p>
            )}

            {entry.cxs && entry.cxs.length > 0 && (
              <div className="mb-2">
                <strong>Cross-References:</strong>
                <ul className="list-disc list-inside">
                  <li>
                    {entry.cxs[0].cxl} {cleanText(entry.cxs[0].cxti[0].cxt)}
                  </li>
                </ul>
              </div>
            )}

            {entry.def &&
              entry.def.length > 0 &&
              entry.def[0].sseq &&
              entry.def[0].sseq.length > 0 && (
                <div className="mb-2">
                  <strong>Usage Examples:</strong>
                  <ul className="list-disc list-inside">
                    {entry.def[0].sseq[0][0][1].dt
                      .filter((dt) => dt[0] && dt[0].t === 'text')
                      .map((dt, idx) => (
                        <li key={idx}>{cleanText(dt[0].t)}</li>
                      ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}

      <audio ref={audioRef} />
      Note: You will Listen audio on Second time Play
    </div>
  );
}

export default App;
