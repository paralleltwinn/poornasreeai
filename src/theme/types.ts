import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    surface: {
      main: string;
      variant: string;
      container: string;
      containerHigh: string;
      containerHighest: string;
    };
    outline: {
      main: string;
      variant: string;
    };
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    surface?: {
      main?: string;
      variant?: string;
      container?: string;
      containerHigh?: string;
      containerHighest?: string;
    };
    outline?: {
      main?: string;
      variant?: string;
    };
  }
}

// Augment the Theme interface
declare module '@mui/material/styles' {
  interface Theme {
    customShadows: {
      elevation1: string;
      elevation2: string;
      elevation3: string;
    };
  }

  interface ThemeOptions {
    customShadows?: {
      elevation1?: string;
      elevation2?: string;
      elevation3?: string;
    };
  }
}
