'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import styles from './VoiceRecorderButton.module.css';

interface VoiceRecorderButtonProps {
  onAudioRecorded: (audioBlob: Blob) => void;
}

export default function VoiceRecorderButton({ onAudioRecorded }: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioRecorded(blob);
        // Clean up all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={toggleRecording}
      className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
      aria-label={isRecording ? "Stop Recording" : "Start Recording"}
    >
      {isRecording ? <Square size={20} className={styles.pulseIcon} /> : <Mic size={20} />}
    </button>
  );
}
