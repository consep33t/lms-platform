import React, { useState, useEffect } from 'react';
import { saveVideoOffline, getVideoOffline } from '../../utils/offlineStorage';

interface DownloadLessonButtonProps {
  lessonId: string;
  videoUrl: string;
}

const DownloadLessonButton: React.FC<DownloadLessonButtonProps> = ({ lessonId, videoUrl }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const video = await getVideoOffline(lessonId);
      if (video) setIsDownloaded(true);
    };
    checkStatus();
  }, [lessonId]);

  const handleDownloadToggle = async () => {
    if (isDownloaded) {
      alert('Delete feature not implemented here yet.');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      await saveVideoOffline(lessonId, blob);
      setIsDownloaded(true);
    } catch (err) {
      console.error('Download failed', err);
      alert('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownloadToggle} 
      disabled={isDownloading}
      className={`px-4 py-2 rounded font-semibold ${isDownloaded ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'} ${isDownloading ? 'opacity-50' : ''}`}
    >
      {isDownloading ? 'Downloading...' : isDownloaded ? 'Downloaded' : 'Download for Offline'}
    </button>
  );
};

export default DownloadLessonButton;
