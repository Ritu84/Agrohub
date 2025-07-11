import { Platform } from "react-native";
export const FONTS = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System-Bold',
    android: 'Roboto-Bold',
    default: 'System-Bold',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
};

export const loadFonts = () => {
  return [true]; // Return a dummy value since we're using system fonts
}; 