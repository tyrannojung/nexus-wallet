// 커스텀 테마 정의
import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#e0f2ff',
      100: '#b8dcff',
      200: '#8bc5ff',
      300: '#5eaeff',
      400: '#3197ff',
      500: '#0380ff',
      600: '#0266cc',
      700: '#024c99',
      800: '#013366',
      900: '#001933',
    },
  },
  styles: {
    global: (props: { colorMode: 'light' | 'dark' }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
});
