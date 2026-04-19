import { STREAMING_SERVICES, SERVICE_MAP } from '@/data/services';

describe('Deep link configuration', () => {
  describe('service deep links', () => {
    it('all services have tvos deep links', () => {
      for (const service of STREAMING_SERVICES) {
        expect(service.deepLinks.tvos).toBeDefined();
        expect(typeof service.deepLinks.tvos).toBe('string');
        expect(service.deepLinks.tvos!.length).toBeGreaterThan(0);
      }
    });

    it('all services have android deep links', () => {
      for (const service of STREAMING_SERVICES) {
        expect(service.deepLinks.android).toBeDefined();
        expect(typeof service.deepLinks.android).toBe('string');
        expect(service.deepLinks.android!.length).toBeGreaterThan(0);
      }
    });

    it('all services have web deep links', () => {
      for (const service of STREAMING_SERVICES) {
        expect(service.deepLinks.web).toBeDefined();
        expect(service.deepLinks.web).toMatch(/^https?:\/\//);
      }
    });
  });

  describe('YouTube TV deep links', () => {
    const service = SERVICE_MAP['youtube-tv'];

    it('has a valid tvos link', () => {
      expect(service.deepLinks.tvos).toContain('youtube');
    });

    it('has an Android intent link', () => {
      expect(service.deepLinks.android).toContain('youtube.unplugged');
    });

    it('has a web link', () => {
      expect(service.deepLinks.web).toBe('https://tv.youtube.com');
    });
  });

  describe('ESPN+ deep links', () => {
    const service = SERVICE_MAP['espn-plus'];

    it('has a tvos URL scheme', () => {
      expect(service.deepLinks.tvos).toBe('espn://');
    });

    it('has an Android intent', () => {
      expect(service.deepLinks.android).toContain('espn');
    });

    it('has a web link to ESPN watch', () => {
      expect(service.deepLinks.web).toContain('espn.com/watch');
    });
  });

  describe('Peacock deep links', () => {
    const service = SERVICE_MAP['peacock'];

    it('has a tvos URL scheme', () => {
      expect(service.deepLinks.tvos).toBe('peacocktv://');
    });

    it('has an Android intent', () => {
      expect(service.deepLinks.android).toContain('peacock');
    });
  });

  describe('Hulu deep links', () => {
    const service = SERVICE_MAP['hulu-live'];

    it('has a tvos URL scheme', () => {
      expect(service.deepLinks.tvos).toBe('hulu://');
    });

    it('has a web link', () => {
      expect(service.deepLinks.web).toContain('hulu.com');
    });
  });

  describe('Prime Video deep links', () => {
    const service = SERVICE_MAP['prime-video'];

    it('has a tvos URL scheme', () => {
      expect(service.deepLinks.tvos).toBe('aiv://');
    });

    it('has an Android intent', () => {
      expect(service.deepLinks.android).toContain('amazon');
    });
  });

  describe('Apple TV+ deep links', () => {
    const service = SERVICE_MAP['apple-tv'];

    it('has a tvos URL scheme', () => {
      expect(service.deepLinks.tvos).toBe('videos://');
    });

    it('has a web link', () => {
      expect(service.deepLinks.web).toBe('https://tv.apple.com');
    });
  });

  describe('Android intent format validation', () => {
    it('all Android links for non-Apple services use intent:// scheme', () => {
      for (const service of STREAMING_SERVICES) {
        if (service.id === 'apple-tv') continue;
        const androidLink = service.deepLinks.android;
        if (androidLink && androidLink.startsWith('intent://')) {
          expect(androidLink).toContain('#Intent;');
          expect(androidLink).toContain('package=');
          expect(androidLink).toMatch(/;end$/);
        }
      }
    });
  });
});
