'use client';

import { useState, useEffect } from 'react';
import { Flex, Box, Text, Button, VStack } from '@chakra-ui/react';
import { handleSignUp, handleSignInWrite, handleSignInRead } from '@/utils/webauthn';
import { storage } from '@/utils/indexedDb';
import { Member } from '@/types/member';

export default function Home() {
  const [regCredential, setRegCredential] = useState<PublicKeyCredential | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  // 리랜더링 스테이트
  const [forceRender, setForceRender] = useState(false);

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
    } else {
      alert('Large blob is not supported.');
    }
  };

  const handleSignInClick = async () => {
    if (regCredential) {
      const check = await handleSignInWrite(regCredential);
      if (!check) {
        alert('Something went wrong.');
      }

      // index db state 리랜더링 필요
      setForceRender((prev) => !prev);
      return;
    }
    alert('Something went wrong.');
  };

  const handleReadClick = async () => {
    console.log(regCredential);
    if (regCredential) {
      await handleSignInRead(regCredential);
    } else {
      alert('Please sign up first.');
    }
  };

  const shouldShowSignUpButton = !regCredential && !member;
  const shouldShowSignInButton = !member?.pubk;

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Box textAlign="center" width="496px">
        <Text fontSize="70px" fontWeight={700} mb={40}>
          Nexus Wallet
        </Text>
        <VStack spacing={8}>
          {shouldShowSignUpButton && (
            <Button width="400px" h="48px" borderRadius="8px" bg="#007AFF" onClick={handleSignUpClick}>
              <Text textAlign="center" fontSize="16px" lineHeight="24px" fontWeight="600" color="#FFFFFF">
                Create a secp256r1-based private key in the TEE
              </Text>
            </Button>
          )}
          {shouldShowSignInButton && (
            <Button
              width="400px"
              h="48px"
              borderRadius="8px"
              bg="#0F0F12"
              border="2px solid #007AFF"
              onClick={handleSignInClick}
            >
              <Text textAlign="center" fontSize="16px" lineHeight="24px" fontWeight="600" color="#007AFF">
                Create a secp256k1-based private key in the TEE
              </Text>
            </Button>
          )}
          <Button
            width="400px"
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
