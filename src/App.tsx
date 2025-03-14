import { useState, useRef, useEffect } from 'react'
import './App.css'
import { motion } from 'framer-motion'

// Define the API response type
interface RoastResponse {
  message: string;
  roast_content: string;
  status: string;
  video_url: string;
}

function App() {
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [roastData, setRoastData] = useState<RoastResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  //define base url
  const baseUrl = 'http://3.144.228.254/api'

  // Auto-scroll to results when they're ready
  useEffect(() => {
    if (isReady && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkedInUrl) return

    setIsGenerating(true)
    setError(null)
    
    try {
      // Try the production endpoint first
      let response = await fetch(`${baseUrl}/generate-roast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkedin_url: linkedInUrl }),
      })
      
      // If that fails, try the test endpoint
      if (!response.ok) {
        console.log('Production endpoint failed, trying test endpoint...')
        response = await fetch(`${baseUrl}/generate-roast`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ linkedin_url: linkedInUrl }),
        })
      }
      
      if (!response.ok) {
        //console log the response
        console.log(response)
        throw new Error('Failed to generate roast. Please try again.')
      }
      
      const data: RoastResponse = await response.json()
      
      // Check if we have a valid video URL
      if (!data.video_url) {
        throw new Error('No video URL provided. Please try again.')
      }
      
      setRoastData(data)
      setIsGenerating(false)
      setIsReady(true)
    } catch (err) {
      console.error('Error generating roast:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setIsGenerating(false)
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-container">
          <motion.div 
            className="logo"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🎭
          </motion.div>
          <h1>The Tonight Show with AI 🤖</h1>
        </div>
        <div className="subtitle">
          <span className="emoji-bounce">✨</span> LinkedIn Roast Generator <span className="emoji-bounce">🔥</span>
        </div>
      </header>

      <div className="main-content">
        <div className="card form-card">
          <h2>Drop That LinkedIn URL! 📋</h2>
          <p className="description">
            We'll create a <span className="highlight">SAVAGE</span> TikTok-style roast video in seconds! 
            <span className="emoji-rain">🤣 💀 🎯 🎤</span>
          </p>

          <form onSubmit={handleSubmit} className="linkedin-form">
            <input
              type="url"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="https://linkedin.com/in/your-next-victim"
              className="url-input"
              required
            />
            <button 
              type="submit" 
              className="generate-btn"
              disabled={isGenerating}
            >
              {isGenerating ? 'ROASTING...' : 'ROAST THEM! 🔥'}
            </button>
          </form>
        </div>

        {error && (
          <div className="card error-card">
            <h2>Oops! Something Went Wrong 😬</h2>
            <p className="error-message">{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="try-again-btn"
            >
              Try Again 🔄
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="card result-card">
            <h2>Brewing the Perfect Roast... ☕</h2>
            <div className="loading-container">
              <motion.div 
                className="loading-emoji"
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                🧠
              </motion.div>
              <motion.div 
                className="loading-emoji"
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
              >
                💭
              </motion.div>
              <motion.div 
                className="loading-emoji"
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6
                }}
              >
                🎬
              </motion.div>
            </div>
            <p className="status-text">
              AI is scanning their cringe profile... <br />
              Finding all those humble brags! 🕵️‍♀️
            </p>
          </div>
        )}

        {isReady && roastData && (
          <motion.div 
            ref={resultRef}
            className="card result-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>ROAST IS SERVED! 🍽️</h2>
            
            <div className="video-container">
              <div className="video-wrapper">
                {roastData.video_url ? (
                  <video 
                    controls
                    autoPlay
                    className="roast-video"
                    src={roastData.video_url}
                    poster="/video-poster.png"
                    onError={(e) => {
                      console.error('Video failed to load:', e);
                      // Set a custom message on the video element
                      const target = e.target as HTMLVideoElement;
                      target.style.display = 'none';
                      target.parentElement?.classList.add('video-error');
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="video-error">
                    <span className="error-icon">⚠️</span>
                    <p>Video could not be loaded. Try downloading instead.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="download-section">
              <a 
                href={roastData.video_url} 
                className="download-btn" 
                download="linkedin-roast.mp4"
                target="_blank" 
                rel="noreferrer"
              >
                DOWNLOAD 📥
              </a>
              <button 
                className="share-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My LinkedIn Roast',
                      text: 'Check out this savage LinkedIn roast!',
                      url: roastData.video_url,
                    }).catch(console.error);
                  } else {
                    alert('Sharing not supported on this browser. Copy the link instead: ' + roastData.video_url);
                  }
                }}
              >
                SHARE 🚀
              </button>
            </div>
            
            {roastData.roast_content ? (
              <div className="roast-content">
                {roastData.roast_content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="roast-content">
                <p>Your LinkedIn roast video is ready! We're still brewing up the perfect text roast to go with it. 
                In the meantime, enjoy your video! 🔥</p>
              </div>
            )}
            
            <div className="testimonial">
              <p>"OMG this is SAVAGE! 💀" - Former LinkedIn Connections</p>
            </div>
          </motion.div>
        )}
      </div>

      <footer className="footer">
        <p>Disclaimer: Use at your own risk! We're not responsible for lost connections 👀</p>
        <div className="emoji-footer">
          👔 🤝 📊 🏆 💼 📈 🎯 🔥
        </div>
      </footer>
    </div>
  )
}

export default App
