import { StreamingService } from '@/lib/types';

export const STREAMING_SERVICES: StreamingService[] = [
  {
    id: 'youtube-tv',
    name: 'YouTube TV',
    color: '#FF0000',
    deepLinks: {
      tvos: 'https://tv.youtube.com',
      android: 'intent://tv.youtube.com#Intent;package=com.google.android.apps.youtube.unplugged;scheme=https;end',
      web: 'https://tv.youtube.com',
    },
  },
  {
    id: 'espn-plus',
    name: 'ESPN+',
    color: '#D00',
    deepLinks: {
      tvos: 'espn://',
      android: 'intent://espn.com#Intent;package=com.espn.score_center;scheme=https;end',
      web: 'https://www.espn.com/watch/',
    },
  },
  {
    id: 'peacock',
    name: 'Peacock',
    color: '#000000',
    deepLinks: {
      tvos: 'peacocktv://',
      android: 'intent://peacocktv.com#Intent;package=com.peacocktv.peacockandroid;scheme=https;end',
      web: 'https://www.peacocktv.com/watch/live-tv',
    },
  },
  {
    id: 'hulu-live',
    name: 'Hulu',
    color: '#1CE783',
    deepLinks: {
      tvos: 'hulu://',
      android: 'intent://hulu.com#Intent;package=com.hulu.plus;scheme=https;end',
      web: 'https://www.hulu.com/live-tv',
    },
  },
  {
    id: 'prime-video',
    name: 'Prime Video',
    color: '#00A8E1',
    deepLinks: {
      tvos: 'aiv://',
      android: 'intent://watch.amazon.com#Intent;package=com.amazon.avod;scheme=https;end',
      web: 'https://www.amazon.com/gp/video/storefront',
    },
  },
  {
    id: 'apple-tv',
    name: 'Apple TV+',
    color: '#555555',
    deepLinks: {
      tvos: 'videos://',
      android: 'intent://tv.apple.com#Intent;package=com.apple.atve.androidtv.appletv;scheme=https;end',
      web: 'https://tv.apple.com',
    },
  },
  {
    id: 'mlb-tv',
    name: 'MLB.TV',
    color: '#002D72',
    deepLinks: {
      tvos: 'mlbatbat://',
      android: 'intent://mlb.com#Intent;package=com.bamnetworks.mobile.android.gameday.atbat;scheme=https;end',
      web: 'https://www.mlb.com/tv',
    },
  },
];

export const SERVICE_MAP = Object.fromEntries(
  STREAMING_SERVICES.map((s) => [s.id, s]),
);
