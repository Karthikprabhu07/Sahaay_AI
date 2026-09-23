'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import styles from './ChatWindow.module.css';
import LanguageSwitcher from './LanguageSwitcher';
import VoiceRecorderButton from './VoiceRecorderButton';
import TrustBadge from './TrustBadge';
import DocumentUploadCard from './DocumentUploadCard';
import ApplicationReviewCard from './ApplicationReviewCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  trustData?: { source: string; confidence: number; lastVerified: string };
  isUploading?: boolean;
  applicationData?: any;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am Sahaay, your benefits navigator. How can I assist you today?',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Mock API call to orchestrate
    try {
      // In a real scenario, we'd await fetch('/api/orchestrate', { ... })
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Based on what you've shared, it looks like you might be eligible for the PM-Kisan Scheme.",
        trustData: {
          source: 'pmkisan.gov.in',
          confidence: 94,
          lastVerified: 'Oct 12, 2023'
        }
      };
      setMessages(prev => [...prev, newBotMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAudioRecorded = async (blob: Blob) => {
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: '🎤 [Voice Message]' };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    // Mock STT API call
    try {
      const formData = new FormData();
      formData.append('audio', blob);
      // await fetch('/api/stt', { method: 'POST', body: formData });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I heard your voice message. Please upload your Aadhaar card to proceed.",
      };
      setMessages(prev => [...prev, newBotMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    const id = Date.now().toString();
    const newUserMsg: Message = { id, role: 'user', content: `Uploaded: ${file.name}`, isUploading: true };
    setMessages(prev => [...prev, newUserMsg]);
    
    // Mock Document API call
    try {
      const formData = new FormData();
      formData.append('document', file);
      // await fetch('/api/documents', { method: 'POST', body: formData });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isUploading: false } : m));
      
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Great! I've extracted the details. Please review your application below.",
        applicationData: {
          schemeName: 'PM-Kisan Samman Nidhi',
          applicantName: 'Rahul Kumar',
          fields: {
            'Aadhaar Number': 'XXXX-XXXX-1234',
            'State': 'Karnataka',
            'Land Holding': '1.5 Hectares'
          }
        }
      };
      setMessages(prev => [...prev, newBotMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.avatar}>
            <Bot size={24} />
          </div>
          <div>
            <h1>Sahaay</h1>
            <p>Benefits Navigator</p>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      <div className={styles.messagesContainer}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.botRow}`}>
            {msg.role === 'assistant' && (
              <div className={styles.msgAvatar}>
                <Bot size={16} />
              </div>
            )}
            
            <div className={styles.messageContent}>
              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.botBubble}`}>
                {msg.content}
                {msg.isUploading && <Loader2 size={14} className={styles.spinner} style={{marginLeft: 8, display: 'inline'}} />}
              </div>
              
              {msg.trustData && (
                <TrustBadge {...msg.trustData} />
              )}
              
              {msg.applicationData && (
                <div style={{ marginTop: 12 }}>
                  <ApplicationReviewCard 
                    application={msg.applicationData}
                    onApprove={() => alert('Application Approved!')}
                    onEdit={() => alert('Edit Mode')}
                  />
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className={styles.msgAvatarUser}>
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className={`${styles.messageRow} ${styles.botRow}`}>
            <div className={styles.msgAvatar}>
              <Bot size={16} />
            </div>
            <div className={`${styles.bubble} ${styles.botBubble} ${styles.typingIndicator}`}>
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <div className={styles.uploadSection}>
           <DocumentUploadCard onUpload={handleDocumentUpload} />
        </div>
        
        <div className={styles.inputRow}>
          <VoiceRecorderButton onAudioRecorded={handleAudioRecorded} />
          
          <div className={styles.textInputContainer}>
            <input 
              type="text" 
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className={styles.textInput}
            />
            <button className={styles.sendButton} onClick={handleSend} disabled={!inputValue.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
