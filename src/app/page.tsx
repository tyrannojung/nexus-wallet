'use client';

import { useState } from 'react';
import { Flex, Box, Text, Button, VStack } from '@chakra-ui/react';
import { handleSignUp, handleSignInWrite, handleSignInRead } from '@/utils/webauthn/largeBlob';
import { wallet } from '@/utils/viem';

export default function Home() {
  const [regCredential, setRegCredential] = useState<PublicKeyCredential | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignUpClick = async () => {
    console.log('Before SignUp:', regCredential);
    const value = await handleSignUp();
    if (value) {
      setRegCredential(value);
      Promise.resolve().then(() => {
        console.log('After SignUp:', value);
      });
    }
  };

  const handleSignInClick = async () => {
    console.log(regCredential);
    if (regCredential && 'rawId' in regCredential && 'response' in regCredential) {
      await handleSignInWrite(regCredential);
      setIsSignedIn(true); // SignIn이 성공하면 상태 변경
    } else {
      alert('Please sign up first.');
    }
  };

  const handleReadClick = async () => {
    if (regCredential) {
      await handleSignInRead(regCredential);
    } else {
      alert('Please sign up first.');
    }
  };

  const handleTest = () => {
    const privateKey = wallet.createPrivateKey();
    const publicAddress = wallet.getPrivateKeyFromAddress(privateKey);
    console.log('🚀 ~ handleTest ~ publicAddress:', publicAddress);

    const mnemonic = wallet.createMnemonic();
    const publicAddressFromMnemonic = wallet.getAccountFromMnemonic(mnemonic);
    console.log('🚀 ~ handleTest ~ publicAddressFromMnemonic:', publicAddressFromMnemonic);
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
            onClick={handleTest}
          >
            <Text textAlign="center" fontSize="16px" lineHeight="24px" fontWeight="600" color="#007AFF">
              Wallet Test
            </Text>
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
