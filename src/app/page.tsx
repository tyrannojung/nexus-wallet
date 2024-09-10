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
  Icon,
} from '@chakra-ui/react';
import Image from 'next/image';
import { FaLock, FaKey, FaTrash } from 'react-icons/fa';
import nexusImage from '@/assets/nexus.png';
import { handleSignUp, handleSignInWrite } from '@/utils/webauthn';
import { storage } from '@/utils/indexedDb';
import { Member } from '@/types/member';
import ProgressIndicator from '@/components/ProgressIndicator';
import FeatureSection from '@/components/FeatureSection';
import { WebauthnSignUpData, WebauthnSignInData } from '@/types/webauthn';
import { UserOperationReceipt } from '@/types/accountAbstraction';

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
  const [fidoResult, setFidoResult] = useState<string | WebauthnSignUpData | WebauthnSignInData>('');
  const [erc4337Result, setErc4337Result] = useState<string | UserOperationReceipt | UserOperationReceipt[]>('');

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
    const result = await handleSignUp();
    if (result && result.largeBlobSupport && result.regCredential && result.signUpData) {
      // indexDB 저장
      const memberInfo = await storage.getItem('memberInfo');
      console.log(member);

      // state 저장
      setMember(memberInfo);
      setRegCredential(result.regCredential);
      setFidoResult(result.signUpData);
    } else if (result && !result?.largeBlobSupport) {
      setFidoResult('Large blob is not supported.');
    } else {
      setFidoResult('Something went wrong.');
    }
  };

  const handleSignInClick = async () => {
    console.log(regCredential);
    console.log(member);
    if (!regCredential || !member) return;
    const result = await handleSignInWrite(regCredential, member);
    if (result && result.largeBlobSupport && result.fidoData && result.accountAbstractionData) {
      setFidoResult(result.fidoData);
      setErc4337Result(result.accountAbstractionData);
    } else if (result && !result?.largeBlobSupport) {
      setFidoResult('Large blob is not supported.');
    } else {
      setFidoResult('Something went wrong.');
    }
  };

  const handleReset = async () => {
    try {
      // IndexedDB의 모든 데이터 삭제
      await storage.clearAll();

      // 상태 초기화
      setRegCredential(null);
      setMember(null);
      setFidoResult('');
      setErc4337Result('');

      // 화면 갱신을 위한 상태 변경
      setForceRender((prev) => !prev);

      console.log('Reset completed successfully');
    } catch (error) {
      console.error('Error during reset:', error);
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
                <Box mt={3}>
                  <FeatureSection
                    title="안전한 키 관리"
                    description="Nexus Wallet은 모바일 TEE 저장 기술을 활용하여 다음과 같은 기능을 제공합니다:"
                    items={[
                      'secp256r1 타원곡선 기반 개인 키 생성 및 저장',
                      'secp256k1 타원곡선 기반 개인 키 생성 및 저장',
                    ]}
                  />
                  <FeatureSection
                    title="확장성 있는 계정 구현"
                    description="Nexus Wallet은 Account Abstraction(ERC-4337) 기술을 활용하여 다음과 같은 계정을 제공합니다:"
                    items={['EOA', 'secp256k1-AA', 'secp256r1-AA']}
                  />
                  <Flex justifyContent="center" alignItems="center" gap={6}>
                    {shouldShowSignUpButton && (
                      <Button
                        colorScheme="brand"
                        size="lg"
                        onClick={handleSignUpClick}
                        borderRadius="full"
                        boxShadow="lg"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                        transition="all 0.3s"
                        leftIcon={<Icon as={FaLock} boxSize={5} />}
                        fontSize="xl"
                        py={6}
                        px={8}
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
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', bg: 'brand.50' }}
                        transition="all 0.3s"
                        leftIcon={<Icon as={FaKey} boxSize={5} />}
                        fontSize="xl"
                        py={6}
                        px={8}
                      >
                        secp256k1 키 생성 및 AA 배포
                      </Button>
                    )}
                    {!shouldShowSignUpButton && (
                      <Button
                        colorScheme="red"
                        size="lg"
                        onClick={handleReset}
                        borderRadius="full"
                        boxShadow="lg"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                        transition="all 0.3s"
                        leftIcon={<Icon as={FaTrash} boxSize={5} />}
                        fontSize="xl"
                        py={6}
                        px={8}
                      >
                        FIDO 계정 정보 초기화
                      </Button>
                    )}
                  </Flex>
                </Box>
              </Flex>
            </GridItem>
          </Grid>
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
            <ProgressIndicator
              sequence={[
                { index: 1, message: ['private key 생성 요청', 'challenge 전송'] },
                { index: 2, message: ['생체 인증 요청'] },
                { index: 3, message: ['생체 인증 완료', '키 생성 완료', 'challenge 서명 완료'] },
                { index: 2, message: ['public 데이터 전송'] },
                { index: 1, message: [''] },
              ]}
              title="secp256r1, k1 키 생성 및 저장 과정"
            />
          </Box>
          <Box p={6} borderRadius="xl" bg={useColorModeValue('white', 'gray.800')} boxShadow="xl">
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="brand.500">
              Result
            </Text>
            <Grid templateColumns="1fr 1fr" gap={6}>
              <GridItem>
                <Box
                  p={4}
                  borderRadius="md"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  height="450px"
                  width="100%"
                  overflowY="auto"
                  borderLeft="4px solid"
                  borderColor="blue.500"
                >
                  <Text fontSize="lg" fontWeight="bold" mb={2} color="blue.500">
                    FIDO Data
                  </Text>
                  {typeof fidoResult === 'string' ? (
                    <Text>{fidoResult}</Text>
                  ) : (
                    Object.entries(fidoResult).map(([key, value]) => (
                      <Box key={key} mb={3} p={2} bg={useColorModeValue('white', 'gray.600')} borderRadius="md">
                        <Text fontWeight="bold" mb={1}>
                          {key}:
                        </Text>
                        <Text pl={2} wordBreak="break-all">
                          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        </Text>
                      </Box>
                    ))
                  )}
                </Box>
              </GridItem>
              <GridItem>
                <Box
                  p={4}
                  borderRadius="md"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  height="450px"
                  width="100%"
                  overflowY="auto"
                  borderLeft="4px solid"
                  borderColor="blue.500"
                >
                  <Text fontSize="lg" fontWeight="bold" mb={2} color="blue.500">
                    ERC-4337 Data
                  </Text>
                  {(() => {
                    if (typeof erc4337Result === 'string') {
                      return <Text wordBreak="break-all">{erc4337Result}</Text>;
                    }

                    if (Array.isArray(erc4337Result)) {
                      return erc4337Result.map((result, index) => (
                        <Box key={index} mb={4} p={3} bg={useColorModeValue('white', 'gray.600')} borderRadius="md">
                          <Text fontWeight="bold" mb={2}>
                            Result {index + 1}:
                          </Text>
                          {Object.entries(result).map(([key, value]) => (
                            <Box key={key} mb={2} pl={2}>
                              <Text fontWeight="bold">{key}:</Text>
                              <Text pl={2} wordBreak="break-all">
                                {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                              </Text>
                            </Box>
                          ))}
                        </Box>
                      ));
                    }

                    return Object.entries(erc4337Result).map(([key, value]) => (
                      <Box key={key} mb={3} p={2} bg={useColorModeValue('white', 'gray.600')} borderRadius="md">
                        <Text fontWeight="bold" mb={1}>
                          {key}:
                        </Text>
                        <Text pl={2} wordBreak="break-all">
                          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        </Text>
                      </Box>
                    ));
                  })()}
                </Box>
              </GridItem>
            </Grid>
          </Box>
        </Container>
      </Box>
    </ChakraProvider>
  );
}
