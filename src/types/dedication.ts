export interface PhotoItem {
  id: string;
  url: string;
  caption?: string;
}

export interface PhotoGalleryData {
  id: string;
  title: string;
  coverImage: string;
  images: string[];
}

export interface PreloadedAudio {
  id: string;
  name: string;
  artist: string;
  url: string;
}

export interface DedicationData {
  id: string;
  slug: string;
  partnerName: string;
  senderName: string;
  title: string;
  startDate: string; // ISO string format YYYY-MM-DD
  mainPhoto: string;
  letterTitle: string;
  letterContent: string[];
  question: string;
  answerYesText: string;
  audioUrl: string;
  audioType: 'preloaded' | 'custom';
  galleries: PhotoGalleryData[];
  createdAt: number;
}
