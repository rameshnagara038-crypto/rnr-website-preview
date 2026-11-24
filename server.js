import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'node:path';
import { galleryHandler } from './gallery-api.mjs';

dotenv.config();
const app = express();
const uploadsDir = process.env.GALLERY_DIR || '/var/www/rnrcs.in/storage/uploads';
app.use(cors({origin: process.env.CORS_ORIGIN || false}));
app.use((req,res,next) => {
  if (req.path === '/api/gallery' || req.path === '/api/gallery/login') {
    galleryHandler(req,res,uploadsDir).catch(next);
  } else next();
});
app.use('/uploads', express.static(uploadsDir, {dotfiles:'deny',index:false}));
app.get('/api/youtube-stats', async (req, res) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
      console.error('❌ Server Error: YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID is not configured in .env file.');
      return res.status(500).json({ error: 'Server is not configured for YouTube API.' });
  }

  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;

  try {
      const youtubeResponse = await fetch(url);
      const data = await youtubeResponse.json();

      // --- VVV THIS IS THE NEW DEBUGGING LOGIC VVV ---
      if (!youtubeResponse.ok) {
          // Log the entire error response from Google to see what's wrong.
          console.error('🔥 YouTube API Error Response:', JSON.stringify(data, null, 2));
          throw new Error(data.error?.message || 'Failed to retrieve data from YouTube API.');
      }

      if (!data.items || data.items.length === 0) {
          throw new Error('Channel not found. Check if YOUTUBE_CHANNEL_ID is correct.');
      }
      
      const subscriberCount = data.items[0].statistics.subscriberCount;
      const formattedCount = new Intl.NumberFormat('en-US', {
          // Use one decimal place for more precision (e.g., 11.7K)
          notation: 'compact',
          maximumFractionDigits: 1 
      }).format(subscriberCount);
      
      res.status(200).json({ 
          subscriberCount: Number(subscriberCount),
          formattedSubscribers: formattedCount 
      });

  } catch (error) {
      console.error('Error in /api/youtube-stats:', error.message);
      res.status(500).json({ error: 'Failed to fetch YouTube statistics.' });
  }
});


// --- VVV ADD THIS NEW ENDPOINT FOR VIDEOS VVV ---
app.get('/api/youtube-videos', async (req, res) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
      return res.status(500).json({ error: 'Server not configured for YouTube API.' });
  }

  // This API call gets the ID of your 'uploads' playlist
  const playlistsUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  
  try {
      const playlistsResponse = await fetch(playlistsUrl);
      const playlistsData = await playlistsResponse.json();
      const uploadsPlaylistId = playlistsData.items[0].contentDetails.relatedPlaylists.uploads;

      if (!uploadsPlaylistId) {
          throw new Error('Could not find uploads playlist for the channel.');
      }

      // Now, get the latest 11 videos from that uploads playlist
      const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=11&key=${apiKey}`;
      
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();

      // Format the data cleanly for the frontend
      const videos = videosData.items.map(item => ({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnailUrl: item.snippet.thumbnails.high.url // Use high quality thumbnail
      }));
      
      res.status(200).json(videos);

  } catch (error) {
      console.error('Error fetching YouTube videos:', error.message);
      res.status(500).json({ error: 'Failed to fetch YouTube videos.' });
  }
});



app.use('/api', (_req,res) => res.sendStatus(404));
app.use(express.static(path.resolve('dist')));
const port = process.argv.includes('--frontend') ? (process.env.FRONTEND_PORT || 8084) : (process.env.PORT || 3001);
app.listen(port, () => console.log('RNR website listening on', port));
