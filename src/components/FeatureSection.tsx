import { Box, Text, Heading, UnorderedList, ListItem } from '@chakra-ui/react';

interface FeatureSectionProps {
  title: string;
  description: string;
  items: string[];
}

export default function FeatureSection(props: FeatureSectionProps) {
  const { title, description, items } = props;

  return (
    <Box mb={8}>
      <Heading as="h2" size="xl" color="brand.500" mb={6}>
        {title}
      </Heading>
      <Box>
        <Text fontSize="lg" mb={4}>
          {description}
        </Text>
        <UnorderedList spacing={3}>
          {items.map((item) => (
            <ListItem key={item}>{item}</ListItem>
          ))}
        </UnorderedList>
      </Box>
    </Box>
  );
}
