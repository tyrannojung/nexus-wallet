'use client';

import { useState, useEffect } from 'react';
import {
  Flex,
  Box,
  Text,
  Button,
  Container,
  Heading,
  useColorModeValue,
  Grid,
  GridItem,
  ChakraProvider,
  extendTheme,
  UnorderedList,
  ListItem,
  VStack,
  Icon,
} from '@chakra-ui/react';
import Image from 'next/image';
import { FaLock, FaKey, FaSearch } from 'react-icons/fa';
import nexusImage from '@/assets/nexus.png';
import { handleSignUp, handleSignInWrite, handleSignInRead } from '@/utils/webauthn';
import { storage } from '@/utils/indexedDb';
import { Member } from '@/types/member';
import ProgressIndicator from '@/components/ProgressIndicator';

// 커스텀 테마 정의
const theme = extendTheme({
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

export default function Home() {
  const [regCredential, setRegCredential] = useState<PublicKeyCredential | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [forceRender, setForceRender] = useState(false);
  const [result, setResult] = useState('결과가 여기에 표시됩니다.');

  useEffect(() => {
    const fetchCredential = async () => {
      const storedCredential = await storage.getItem('regCredential');
      const storedMemberInfo = await storage.getItem('memberInfo');
      if (storedCredential && storedMemberInfo) {
        setRegCredential(storedCredential);
        setMember(storedMemberInfo);
      }
    };

    fetchCredential();
  }, [forceRender]);

  const handleSignUpClick = async () => {
    const value = await handleSignUp();
    if (value) {
      const memberInfo = await storage.getItem('memberInfo');
      setMember(memberInfo);
      setRegCredential(value);
      setResult('secp256r1 키가 TEE에서 성공적으로 생성되었습니다.');
    } else {
      setResult('Large blob is not supported.');
    }
  };

  const handleSignInClick = async () => {
    if (regCredential) {
      const check = await handleSignInWrite(regCredential);
      if (!check) {
        setResult('Something went wrong.');
      } else {
        setResult('secp256k1 키가 TEE에서 성공적으로 생성되었습니다.');
      }
      setForceRender((prev) => !prev);
      return;
    }
    setResult('Something went wrong.');
  };

  const handleReadClick = async () => {
    if (regCredential) {
      const readResult = await handleSignInRead(regCredential);
      setResult(`Local Value Check 결과: ${JSON.stringify(readResult)}`);
    } else {
      setResult('Please sign up first.');
    }
  };

  const shouldShowSignUpButton = !regCredential && !member;
  const shouldShowSignInButton = !member?.eoa;

  return (
    <ChakraProvider theme={theme}>
      <Box minHeight="100vh" py={12} px={8}>
        <Container maxW="container.xl">
          <Flex direction="column" mb={12}>
            <Heading as="h1" size="2xl" color="brand.500" mb={4} textAlign="left">
              Nexus Wallet
            </Heading>
            <Text fontSize="xl" textAlign="left" maxWidth="800px" mb={2}>
              Nexus Wallet은 TEE(신뢰 실행 환경)를 활용한 최신 기술의 디지털 지갑입니다.
            </Text>
            <Text fontSize="xl" textAlign="left" maxWidth="800px">
              안전한 블록체인 키 생성 및 관리를 위해 설계되었으며, 높은 수준의 보안을 제공합니다.
            </Text>
          </Flex>

          <Grid templateColumns="1fr 1fr" gap={12} mb={12}>
            <GridItem display="flex" justifyContent="center" alignItems="center">
              <Image
                src={nexusImage}
                alt="Nexus Wallet"
                width={450}
                height={300}
                style={{
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              />
            </GridItem>
            <GridItem>
              <Flex direction="column" height="100%">
                <Box>
                  <Heading as="h2" size="xl" color="brand.500" mb={6}>
                    안전한 키 관리
                  </Heading>
                  <Box mb={8}>
                    <Text fontSize="lg" mb={4}>
                      Nexus Wallet은 모바일 TEE 저장 기술을 활용하여 다음과 같은 기능을 제공합니다:
                    </Text>
                    <UnorderedList spacing={3}>
                      <ListItem>secp256r1 타원곡선 기반 개인 키 생성 및 저장</ListItem>
                      <ListItem>secp256k1 타원곡선 기반 개인 키 생성 및 저장</ListItem>
                      <ListItem>저장 확인</ListItem>
                    </UnorderedList>
                  </Box>
                </Box>
                <Box flexGrow={1}>
                  <VStack spacing={4} align="stretch">
                    {shouldShowSignUpButton && (
                      <Button
                        colorScheme="brand"
                        size="lg"
                        onClick={handleSignUpClick}
                        borderRadius="full"
                        boxShadow="md"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                        leftIcon={<Icon as={FaLock} />}
                      >
                        secp256r1 키 생성
                      </Button>
                    )}
                    {shouldShowSignInButton && (
                      <Button
                        colorScheme="brand"
                        variant="outline"
                        size="lg"
                        onClick={handleSignInClick}
                        borderRadius="full"
                        boxShadow="md"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                        leftIcon={<Icon as={FaKey} />}
                      >
                        secp256k1 키 생성
                      </Button>
                    )}
                    <Button
                      colorScheme="brand"
                      variant="ghost"
                      size="lg"
                      onClick={handleReadClick}
                      borderRadius="full"
                      _hover={{ bg: 'brand.50', transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                      leftIcon={<Icon as={FaSearch} />}
                    >
                      로컬 값 확인
                    </Button>
                  </VStack>
                </Box>
              </Flex>
            </GridItem>
          </Grid>
          {/* ProgressIndicator 추가 */}
          <Box
            mb={8}
            bg={useColorModeValue('white', 'gray.800')}
            p={6}
            borderRadius="xl"
            boxShadow="md"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <ProgressIndicator sequence={[1, 3, 3]} title="secp256k1 키 생성 및 저장 과정" />
          </Box>
          <Box p={6} borderRadius="xl" bg={useColorModeValue('white', 'gray.800')} boxShadow="xl">
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="brand.500">
              Result
            </Text>
            <Box
              p={4}
              borderRadius="md"
              bg={useColorModeValue('gray.100', 'gray.700')}
              height="600px" // 높이를 200px로 고정
              overflowY="auto" // 세로 스크롤 허용
            >
              <Text>{result}</Text>
            </Box>
          </Box>
        </Container>
      </Box>
    </ChakraProvider>
  );
}
