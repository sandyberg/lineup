import { mapSport } from '../sports-api';

describe('mapSport', () => {
  describe('NFL', () => {
    it('maps NFL league', () => {
      expect(mapSport('Football', 'NFL')).toBe('nfl');
    });

    it('maps American Football by league', () => {
      expect(mapSport('American Football', 'American Football League')).toBe('nfl');
    });

    it('does not confuse soccer football with NFL', () => {
      expect(mapSport('Football', 'English Premier League')).toBe('soccer');
    });
  });

  describe('NBA', () => {
    it('maps NBA league', () => {
      expect(mapSport('Basketball', 'NBA')).toBe('nba');
    });

    it('is case insensitive on league', () => {
      expect(mapSport('Basketball', 'nba')).toBe('nba');
    });
  });

  describe('MLB', () => {
    it('maps MLB league', () => {
      expect(mapSport('Baseball', 'MLB')).toBe('mlb');
    });

    it('maps by sport name alone', () => {
      expect(mapSport('Baseball', 'Some League')).toBe('mlb');
    });
  });

  describe('NHL', () => {
    it('maps NHL league', () => {
      expect(mapSport('Ice Hockey', 'NHL')).toBe('nhl');
    });

    it('maps by hockey sport name', () => {
      expect(mapSport('Hockey', 'Some Hockey League')).toBe('nhl');
    });
  });

  describe('Soccer', () => {
    it('maps by soccer sport name', () => {
      expect(mapSport('Soccer', 'MLS')).toBe('soccer');
    });

    it('maps football (non-American) as soccer', () => {
      expect(mapSport('Football', 'Premier League')).toBe('soccer');
    });
  });

  describe('College sports', () => {
    it('maps NCAA football', () => {
      expect(mapSport('Football', 'NCAA Division I')).toBe('college-football');
    });

    it('maps NCAA basketball', () => {
      expect(mapSport('Basketball', 'NCAA')).toBe('college-basketball');
    });
  });

  describe('Other sports', () => {
    it('maps golf', () => {
      expect(mapSport('Golf', 'PGA Tour')).toBe('golf');
    });

    it('maps tennis', () => {
      expect(mapSport('Tennis', 'ATP')).toBe('tennis');
    });

    it('maps MMA', () => {
      expect(mapSport('MMA', 'UFC')).toBe('mma');
    });

    it('maps fighting as MMA', () => {
      expect(mapSport('Fighting', 'UFC')).toBe('mma');
    });

    it('maps motorsport as racing', () => {
      expect(mapSport('Motorsport', 'F1')).toBe('racing');
    });

    it('maps racing', () => {
      expect(mapSport('Racing', 'NASCAR')).toBe('racing');
    });
  });

  describe('unknown sports', () => {
    it('returns other for unknown', () => {
      expect(mapSport('Curling', 'World Curling')).toBe('other');
    });

    it('returns other for empty strings', () => {
      expect(mapSport('', '')).toBe('other');
    });
  });
});
