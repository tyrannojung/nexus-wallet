'use client';

import { ChakraProvider } from '@chakra-ui/react';
import NexusWallet from './nexus/page'; // nexus 페이지의 핵심 코드를 가져옴
import { theme } from '@/utils/theme'; // 테마 파일을 별도로 관리

export default function Home() {
  return (
    <ChakraProvider theme={theme}>
      <NexusWallet />
    </ChakraProvider>
  ); // 경로가 바뀌지 않고 Nexus 페이지 렌더링
}
