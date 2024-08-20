'use client';

import { useState, useEffect } from 'react';
import { Flex, Box, Text, Button, VStack } from '@chakra-ui/react';
import { handleSignUp, handleSignInWrite, handleSignInRead } from '@/utils/webauthn/largeBlob';
import { storage } from '@/utils/indexedDb';
import { mockCredential } from '@/utils/indexedDb/__mocks__/credential.mock';

export default function Home() {
  const [regCredential, setRegCredential] = useState<PublicKeyCredential | null>(mockCredential);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const fetchCredential = async () => {
      const storedCredential = await storage.getItem('regCredential');
      if (storedCredential) {
        setRegCredential(storedCredential);
      }
    };

    fetchCredential();
  }, []);

  const handleSignUpClick = async () => {
    console.log('Before SignUp:', regCredential);
    const value = await handleSignUp();
    if (value) {
      // 인덱스 디비에서 가져온다.
      setRegCredential(value);
      await storage.setItem('regCredential', value);
      // const checkRegCredential = await storage.getItem('regCredential');
      // console.log('🚀 ~ handleSignUpClick ~ checkRegCredential:', checkRegCredential);
      // const memberInfo = await storage.getItem('memberInfo');
      // console.log('🚀 ~ handleSignUpClick ~ memberInfo:', memberInfo);
      Promise.resolve().then(() => {
        console.log('After SignUp:', value);
      });
    }
  };

  const handleSignInClick = async () => {
    if (regCredential && 'rawId' in regCredential && 'response' in regCredential) {
      const check = await handleSignInWrite(regCredential);
      if (check) {
        setIsSignedIn(true); // SignIn이 성공하면 상태 변경
        return;
      }
      alert('Large blob is not supported.');
    }
    alert('Please sign up first.');
  };

  const handleReadClick = async () => {
    console.log(regCredential);
    if (regCredential) {
      await handleSignInRead(regCredential);
    } else {
      alert('Please sign up first.');
    }
  };

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Box textAlign="center" width="496px">
        <Text fontSize="70px" fontWeight={700} mb={40}>
          Nexus Wallet
        </Text>
        <VStack spacing={8}>
          <Button width="378px" h="48px" borderRadius="8px" bg="#007AFF" onClick={handleSignUpClick}>
            <Text textAlign="center" fontSize="16px" lineHeight="24px" fontWeight="600" color="#FFFFFF">
              LargeBlob SignUp
            </Text>
          </Button>
          <Button
            width="378px"
            h="48px"
            borderRadius="8px"
            bg="#0F0F12"
            border="2px solid #007AFF"
            onClick={!isSignedIn ? handleSignInClick : handleReadClick}
          >
            <Text textAlign="center" fontSize="16px" lineHeight="24px" fontWeight="600" color="#007AFF">
              {!isSignedIn ? 'LargeBlob SignIn' : 'LargeBlob Read'}
            </Text>
          </Button>
          <Button
            width="378px"
            h="48px"
            borderRadius="8px"
            bg="#0F0F12"
            border="2px solid #007AFF"
            onClick={handleReadClick}
          >
            <Text textAlign="center" fontSize="16px" lineHeight="24px" fontWeight="600" color="#007AFF">
              Local Value Check
            </Text>
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
