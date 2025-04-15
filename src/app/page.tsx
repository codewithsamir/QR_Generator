'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Dropzone } from '@/components/ui/dropzone';
import { ThemeToggle } from "@/components/theme-toggle";
import imageCompression from 'browser-image-compression';

type ContentType = 'Website' | 'Text' | 'PDF' | 'Image';

export default function Home() {
  // Content type and input
  const [activeContentType, setActiveContentType] = useState<ContentType>('Text');
  const [text, setText] = useState('');
  const [qrValue, setQrValue] = useState('');
  
  // Appearance settings
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [isTransparent, setIsTransparent] = useState(false);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrWidth, setQrWidth] = useState(200);
  const [qrHeight, setQrHeight] = useState(200);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [invert, setInvert] = useState(false);
  
  // File references and upload state
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Loading states for uploads
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Error states for uploads
  const [pdfUploadError, setPdfUploadError] = useState<string>('');
  const [imageUploadError, setImageUploadError] = useState<string>('');

  const handleWidthChange = (value: number) => {
    setQrWidth(value);
    if (maintainAspectRatio) {
      setQrHeight(value);
    }
  };

  const handleHeightChange = (value: number) => {
    setQrHeight(value);
    if (maintainAspectRatio) {
      setQrWidth(value);
    }
  };

  const handlePdfUpload = async (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setPdfFile(file);
      setIsUploadingPdf(true); // Start loading
      setPdfUrl(''); // Clear previous URL
      setText(''); // Clear text input
      setPdfUploadError(''); // Clear previous error

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          // Try to get error message from response body
          let errorMsg = `Upload failed with status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (parseError) {
            // Ignore if response body is not JSON or other error
            console.error("Could not parse error response:", parseError);
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        if (data.secure_url) {
          setPdfUrl(data.secure_url);
          setText(`PDF: ${file.name} (${data.secure_url})`);
        }
      } catch (error) {
        console.error('Error uploading PDF:', error);
        setPdfFile(null); // Clear file on error
        setPdfUrl(''); // Clear URL on error
        if (error instanceof Error) {
          setPdfUploadError(error.message); // Set error state
        } else {
          setPdfUploadError('An unknown upload error occurred.');
        }
      } finally {
        setIsUploadingPdf(false); // Stop loading
      }
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files && files.length > 0) {
      const originalFile = files[0];
      setImageFile(originalFile);
      setIsUploadingImage(true);
      setImageUrl('');
      setText('');
      setImageUploadError('');

      // --- Image Compression --- 
      const options = {
        maxSizeMB: 2, // Target size: 2MB
        maxWidthOrHeight: 1920, // Optional: Max dimension resize
        useWebWorker: true, // Optional: Use web worker for performance
      };

      try {
        console.log(`Original image size: ${(originalFile.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await imageCompression(originalFile, options);
        console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        // --- End Compression ---
        
        const formData = new FormData();
        // Upload the compressed file, but use the original name
        formData.append('file', compressedFile, originalFile.name); 

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          // Try to get error message from response body
          let errorMsg = `Upload failed with status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (parseError) {
            // Ignore if response body is not JSON or other error
            console.error("Could not parse error response:", parseError);
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        if (data.secure_url) {
          setImageUrl(data.secure_url);
          setText(`${data.secure_url}`);
        }
      } catch (error) {
        console.error('Error during image processing or upload:', error);
        setImageFile(null);
        setImageUrl('');
        if (error instanceof Error) {
          setImageUploadError(`Upload Error: ${error.message}`);
        } else {
          setImageUploadError('An unknown upload error occurred.');
        }
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const generateQR = () => {
    if (text.trim()) {
      setQrValue(text);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code') as unknown as SVGSVGElement;
    if (svg) {
      try {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = qrWidth;
          canvas.height = qrHeight;
          ctx?.drawImage(img, 0, 0, qrWidth, qrHeight);
          
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = 'qr-code.png';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      } catch (error) {
        console.error('Error downloading QR code:', error);
      }
    }
  };

  const getPlaceholder = () => {
    switch (activeContentType) {
      case 'Website':
        return 'E.g. https://www.myweb.com/';
      case 'Text':
        return 'Enter some text...';
      case 'PDF':
        return pdfFile ? pdfFile.name : 'Upload a PDF file';
      case 'Image':
        return imageFile ? imageFile.name : 'Upload an image';
      default:
        return 'Enter content';
    }
  };

  const getInputLabel = () => {
    switch (activeContentType) {
      case 'Website':
        return 'Enter your Website';
      case 'Text':
        return 'Message *';
      case 'PDF':
        return 'Upload PDF';
      case 'Image':
        return 'Upload Image';
      default:
        return 'Enter content';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-60 bg-white dark:bg-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={40}
            height={40}
            className="mb-2"
            priority
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">by Samir Rain</p>
          <a 
            href="https://samirrain.com.np" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 block"
          >
            samirrain.com.np
          </a>
        </div>
        <nav className="flex-1 pt-2">
          {(['Website', 'Text', 'PDF', 'Image'] as ContentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveContentType(type)}
              className={`w-full flex items-center gap-3 px-4 py-3 ${
                activeContentType === type 
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 border-r-4 border-blue-600 dark:border-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                activeContentType === type ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {type === 'Website' && <span>🌐</span>}
                {type === 'Text' && <span>📝</span>}
                {type === 'PDF' && <span>📄</span>}
                {type === 'Image' && <span>🖼️</span>}
              </div>
              <span className="font-medium">{type}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header section */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h3 className="font-bold text-lg">QR Generator</h3>

            <div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Original main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Content & Settings */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="w-8 h-8 rounded-full bg-purple-900 dark:bg-purple-700 text-white dark:text-gray-100 flex items-center justify-center mr-3">
                      1
                    </div>
                    <h2 className="text-xl font-bold">Enter your content</h2>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {getInputLabel()}
                      </label>
                      {activeContentType === 'PDF' ? (
                        <Dropzone
                          onDrop={handlePdfUpload}
                          accept={{ 'application/pdf': ['.pdf'] }}
                          maxSize={5242880}
                          label="Drag and drop your PDF here"
                          sublabel="or click to browse"
                          fileName={pdfFile?.name}
                          loading={isUploadingPdf}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                        />
                      ) : activeContentType === 'Image' ? (
                        <Dropzone
                          onDrop={handleImageUpload}
                          accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }}
                          maxSize={5242880}
                          label="Drag and drop your image here"
                          sublabel="or click to browse"
                          fileName={imageFile?.name}
                          loading={isUploadingImage}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                        />
                      ) : (
                        <Input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder={getPlaceholder()}
                          className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      )}
                      {/* PDF Upload Error Message */}
                      {activeContentType === 'PDF' && pdfUploadError && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {pdfUploadError}
                        </div>
                      )}
                      {/* Image Upload Error Message */}
                      {activeContentType === 'Image' && imageUploadError && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {imageUploadError}
                        </div>
                      )}
                    </div>
                    {/* PDF Preview */} 
                    {activeContentType === 'PDF' && pdfUrl && (
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PDF Uploaded:</p>
                        <a 
                          href={pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {pdfFile?.name || pdfUrl}
                        </a>
                      </div>
                    )}
                    {/* Image Preview / URL */} 
                    {activeContentType === 'Image' && imageUrl && (
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Uploaded:</p>
                        <a 
                          href={imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {imageFile?.name || imageUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="w-8 h-8 rounded-full bg-purple-900 dark:bg-purple-700 text-white dark:text-gray-100 flex items-center justify-center mr-3">
                      2
                    </div>
                    <h2 className="text-xl font-bold">Customize your QR</h2>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {/* Error Level */}
                    <div>
                      <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">Error Correction Level</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { level: 'Q', percent: '25%', color: 'blue' },
                          { level: 'H', percent: '30%', color: 'black' },
                          { level: 'M', percent: '15%', color: 'black' },
                          { level: 'L', percent: '7%', color: 'black' }
                        ].map((item) => (
                          <div
                            key={item.level}
                            onClick={() => setErrorLevel(item.level as 'L' | 'M' | 'Q' | 'H')}
                            className={`cursor-pointer rounded-lg p-3 flex flex-col items-center ${
                              errorLevel === item.level
                                ? 'bg-blue-100 dark:bg-blue-900/60 border-2 border-blue-500 dark:border-blue-400'
                                : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div
                              className={`w-12 h-12 sm:w-16 sm:h-16 mb-2 p-1 rounded-md bg-white dark:bg-gray-300 ${
                                item.color === 'blue' ? 'text-blue-600' : 'text-black'
                              }`}
                            >
                              <QRCodeSVG
                                value="Example"
                                size={item.level === 'L' || item.level === 'M' ? 48 : 64} // Adjust size based on level if needed
                                level={item.level as 'L' | 'M' | 'Q' | 'H'}
                                fgColor={item.color === 'blue' ? '#2563eb' : '#000000'}
                                bgColor="#FFFFFF" // Keep background white for preview clarity
                              />
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900 dark:text-gray-100">Level {item.level}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{item.percent}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Size Settings */}
                    <div>
                      <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">QR Code Dimensions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width (px)</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={qrWidth}
                              onChange={(e) => handleWidthChange(Number((e.target as HTMLInputElement).value))}
                              min={100}
                              max={1000}
                              className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <Slider
                            value={qrWidth}
                            onChange={(e) => handleWidthChange(Number((e.target as HTMLInputElement).value))}
                            min={100}
                            max={1000}
                            className="mt-2 bg-gray-200 dark:bg-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height (px)</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={qrHeight}
                              onChange={(e) => handleHeightChange(Number((e.target as HTMLInputElement).value))}
                              min={100}
                              max={1000}
                              className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                              disabled={maintainAspectRatio}
                            />
                          </div>
                          <Slider
                            value={qrHeight}
                            onChange={(e) => handleHeightChange(Number((e.target as HTMLInputElement).value))}
                            min={100}
                            max={1000}
                            className="mt-2 bg-gray-200 dark:bg-gray-600"
                            disabled={maintainAspectRatio}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={maintainAspectRatio}
                            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 rounded bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                          />
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Maintain aspect ratio (1:1)</span>
                        </label>
                      </div>
                    </div>

                    {/* Color Settings */}
                    <div>
                      <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">Colors</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foreground Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                            />
                            <Input
                              type="text"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                            />
                            <Input
                              type="text"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={isTransparent}
                            onChange={(e) => setIsTransparent(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 rounded bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                          />
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Transparent background</span>
                        </label>
                        <Button
                          onClick={() => setInvert(!invert)}
                          variant="outline"
                          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v.756a49.106 49.106 0 019.152 1 .75.75 0 01-.152 1.485h-1.918l2.474 10.605a.75.75 0 01-.734.905H15.75a.75.75 0 01-.734-.905l2.474-10.605H15a.75.75 0 010-1.5H12V3a.75.75 0 01.75-.75zm-6 0a.75.75 0 01.75.75v.756a49.106 49.106 0 019.152 1 .75.75 0 01-.152 1.485h-1.918l2.474 10.605a.75.75 0 01-.734.905H3.75a.75.75 0 01-.734-.905L5.49 6.246H3a.75.75 0 010-1.5h3V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
                          </svg>
                          Invert colors
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        onClick={generateQR}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-gray-100 rounded-lg transition-colors"
                      >
                        Generate QR Code
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview & Download */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6 sticky top-4">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="w-8 h-8 rounded-full bg-purple-900 dark:bg-purple-700 text-white dark:text-gray-100 flex items-center justify-center mr-3">
                      3
                    </div>
                    <h2 className="text-xl font-bold">Download your QR</h2>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col items-center">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-md rounded-lg mb-4 md:mb-6 w-full flex justify-center">
                      {qrValue ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          style={{ width: qrWidth, height: qrHeight, background: 'white', padding: '10px', borderRadius: '4px' }}
                        >
                          <QRCodeSVG
                            id="qr-code"
                            value={qrValue}
                            size={Math.min(qrWidth, qrHeight) - 20}
                            level={errorLevel}
                            fgColor={invert ? (isTransparent ? '#FFFFFF' : bgColor) : color}
                            bgColor={invert ? color : (isTransparent ? 'transparent' : '#FFFFFF')}
                            includeMargin={false}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-[200px] h-[200px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                          QR preview
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={downloadQR}
                      disabled={!qrValue}
                      className={`w-full flex items-center justify-center gap-2 ${
                        !qrValue
                          ? 'opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                          : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-gray-100'
                      }`}
                    >
                      <span>Download QR</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
