'use client';

import { Flex, Box, Text, Button, VStack } from '@chakra-ui/react';
import handleSignup from '@/utils/prf';

export default function Home() {
  const handleLoginClick = async () => {
    await handleSignup();
  };

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Box textAlign="center" width="496px">
        <Text fontSize="70px" fontWeight={700} mb={40}>
          Nexus Wallet
        </Text>
        <VStack spacing={8}>
          <Button width="378px" h="48px" borderRadius="8px" bg="#007AFF" onClick={handleLoginClick}>
            <Text textAlign="center" fontSize="16px" lineHeight="24px" fontWeight="600" color="#FFFFFF">
              Prf Test
            </Text>
          </Button>
          <Button width="378px" h="48px" borderRadius="8px" bg="#0F0F12" border="2px solid #007AFF">
            <Text textAlign="center" fontSize="16px" lineHeight="24px" fontWeight="600" color="#007AFF">
              LargeBlob Test
            </Text>
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
