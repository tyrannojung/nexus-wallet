import React, { useState, useEffect, useCallback } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMobileAlt, FaDesktop, FaUser, FaCheck } from 'react-icons/fa';

const MotionBox = motion(Box);

interface IconProps {
  icon: React.ElementType;
  title: string;
  active: boolean;
}

function Icon({ icon: IconComponent, title, active }: IconProps) {
  return (
    <Flex direction="column" alignItems="center" width="80px">
      <Box position="relative" width="50px" height="50px" mb="10px">
        <Flex
          width="100%"
          height="100%"
          borderRadius="50%"
          bg="gray.700"
          justifyContent="center"
          alignItems="center"
          color="white"
        >
          <IconComponent size={24} />
        </Flex>
        <AnimatePresence>
          {active && (
            <MotionBox
              position="absolute"
              top="50%"
              left="50%"
              width="20px"
              height="20px"
              borderRadius="50%"
              bg="green.500"
              display="flex"
              justifyContent="center"
              alignItems="center"
              initial={{ scale: 0, x: '-50%', y: '-50%' }}
              animate={{ scale: 1, x: '-50%', y: '-50%' }}
              exit={{ scale: 0, x: '-50%', y: '-50%' }}
              transition={{ duration: 0.3 }}
            >
              <FaCheck color="white" size={12} />
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
      <Text fontSize="12px" textAlign="center">
        {title}
      </Text>
    </Flex>
  );
}

function Line({ showDot, message, reverse }: { showDot: boolean; message: string[]; reverse: boolean }) {
  return (
    <Box position="relative" width="250px" height="2px" bg="gray.300">
      <Box
        position="absolute"
        bottom="-40px" // 메시지 개수에 따라 위치를 바꿔야 할듯
        left="50%"
        transform="translateX(-50%)"
        fontSize="12px"
        color="gray.700"
        textAlign="center"
        opacity={showDot ? 1 : 0}
        transition="opacity 0.5s ease-in-out"
      >
        {message.map((line, index) => (
          <Text key={line} mb={index < message.length - 1 ? 1 : 0}>
            {line}
          </Text>
        ))}
      </Box>
      <AnimatePresence>
        {showDot && (
          <MotionBox
            position="absolute"
            top="-3px"
            left="-4px"
            width="8px"
            height="8px"
            borderRadius="50%"
            bg="green.500"
            initial={{ left: reverse ? 'calc(100% - 4px)' : '-4px' }}
            animate={{ left: reverse ? '-4px' : 'calc(100% - 4px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}

const icons = [FaDesktop, FaMobileAlt, FaUser];
const titles = ['Wallet', 'Authenticator', 'User'];
interface SequenceItem {
  index: number;
  message: string[];
}

export default function ProgressIndicator({
  sequence,
  title,
}: {
  sequence: SequenceItem[]; // 수정된 타입
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showDot, setShowDot] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = sequence.length - 1;
  const isCompleted = currentStep === totalSteps;

  const resetProgress = useCallback(() => {
    setCurrentIndex(-1);
    setShowDot(false);
    setActiveIcon(null);
    setCurrentStep(0);
  }, []);

  const progressStep = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= sequence.length - 1) {
        setActiveIcon(sequence[sequence.length - 1].index - 1);
      }
      return nextIndex;
    });
    setShowDot(true);
    setCurrentStep((prevStep) => Math.min(prevStep + 1, totalSteps));
  }, [sequence, totalSteps]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex >= sequence.length - 1) {
        resetProgress();
      } else {
        progressStep();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, sequence, resetProgress, progressStep]);

  useEffect(() => {
    if (!showDot) return;

    const timer = setTimeout(() => {
      setShowDot(false);
      if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
        const nextIconIndex = sequence[currentIndex + 1].index - 1;
        setActiveIcon(nextIconIndex);
      }
    }, 1000);
    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timer);
  }, [showDot, currentIndex, sequence]);

  const getLineProps = (index: number) => {
    if (currentIndex < 0 || currentIndex >= sequence.length - 1) {
      return { showDot: false, reverse: false, message: [] }; // 빈 배열 반환
    }
    const current = sequence[currentIndex].index - 1;
    const next = sequence[currentIndex + 1].index - 1;
    const { message } = sequence[currentIndex]; // 배열 그대로 사용
    if (index === Math.min(current, next)) {
      return { showDot, reverse: current > next, message };
    }
    return { showDot: false, reverse: false, message: [] }; // 빈 배열 반환
  };

  return (
    <Flex direction="column" alignItems="center" width="100%">
      <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
        {title}
      </Text>
      <Flex direction="column" alignItems="center" width="100%" maxWidth="740px">
        <Flex alignItems="center" position="relative" width="100%">
          {[0, 1, 2].map((iconIndex) => (
            <React.Fragment key={iconIndex}>
              <Icon
                icon={icons[iconIndex]}
                title={titles[iconIndex]}
                active={
                  activeIcon === iconIndex || (isCompleted && iconIndex === sequence[sequence.length - 1].index - 1)
                }
              />
              {iconIndex < 2 && <Line {...getLineProps(iconIndex)} />}
            </React.Fragment>
          ))}
        </Flex>
        <Text mt={4} fontSize="sm" color="gray.500" textAlign="center">
          {isCompleted ? 'Completed' : `Step ${currentStep + 1} of ${totalSteps + 1}`}
        </Text>
      </Flex>
    </Flex>
  );
}
