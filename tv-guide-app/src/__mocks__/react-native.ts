export const Platform = {
  OS: 'web',
  select: (obj: Record<string, unknown>) => obj.web ?? obj.default,
  isTV: false,
};

export const Linking = {
  openURL: jest.fn(),
  canOpenURL: jest.fn().mockResolvedValue(true),
};

export const Alert = {
  alert: jest.fn(),
};
