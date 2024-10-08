import axios from "axios";
import { FormEvent, useEffect, useState } from "react";

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function App() {
  const [url, setUrl] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [samples, setSamples] = useState<string[]>([]);
  const [activeSampleIndex, setActiveSampleIndex] = useState<null | number>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!samples.length) {
      axios.get(`${apiUrl}/samples`)
        .then(response => {
          setSamples(response.data);
        });
    }
  }, [samples, apiUrl]);

  useEffect(() => {
    if (samples.length) {
      randomSample();
      const interval = setInterval(() => {
        randomSample();
        console.log('random now');
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [samples]);

  function randomSample() {
    const random = randomIntFromInterval(0, samples.length - 1);
    console.log(random);
    setActiveSampleIndex(random);
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setLoadingMessage('Generating assets...');
    const assetsResponse = await axios.get(
      `${apiUrl}/create-story?url=` + encodeURIComponent(url)
    );
    const id = await assetsResponse.data;
    setLoadingMessage('Preparing your video...');
    const videoResponse = await axios.get(`${apiUrl}/build-video?id=` + id);
    setLoadingMessage('');
    window.location.href = `${apiUrl}/` + videoResponse.data;
  }

  return (
    <>
      {loadingMessage && (
        <div className="fixed inset-0 z-20 bg-black/90 flex justify-center items-center">
          <p className="text-4xl text-center">
            {loadingMessage}
          </p>
        </div>
      )}
      <main className="max-w-2xl mx-auto flex flex-col gap-8 px-4 md:flex-row md:gap-16">
        <div className="py-8 flex flex-col justify-center text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold uppercase mb-4">
            <span className="text-4xl md:text-5xl block">
              URL to Video
            </span>
            <span className="bg-gradient-to-br from-emerald-300 from-30% to-sky-300 bg-clip-text text-transparent">
              with power of AI
            </span>
          </h1>
          <form
            onSubmit={handleSubmit}
            className="grid gap-2">
            <input
              className="border-2 rounded-full bg-transparent text-white px-4 py-2 grow"
              value={url}
              onChange={ev => setUrl(ev.target.value)}
              type="url"
              placeholder="https://..." />
            <button
              className="bg-emerald-500 text-white px-4 py-2 rounded-full uppercase"
              type="submit">
              Create&nbsp;video
            </button>
          </form>
        </div>
        <div className="py-4 flex justify-center md:block">
          <div className="text-gray-500 w-[200px] h-[320px] sm:w-[240px] sm:h-[380px] relative">
            {samples?.length > 0 && samples.map((sample, samplesKey) => (
              <video
                key={samplesKey}
                playsInline={true}
                muted={true}
                controls={false}
                loop={true}
                autoPlay={true}
                className="shadow-4xl shadow-sky-400 rounded-2xl overflow-hidden absolute top-2 transition-all duration-300"
                style={{
                  opacity: samplesKey === activeSampleIndex ? '1' : '0',
                  transform: 'scaleX(1) scaleY(1) scaleZ(1) rotateX(0deg) rotateY(0deg) rotateZ(3deg) translateX(0px) translateY(0px) translateZ(0px) skewX(0deg) skewY(0deg)'
                }}
                src={`${apiUrl}/` + sample + '/final.mp4'}></video>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export default App;
