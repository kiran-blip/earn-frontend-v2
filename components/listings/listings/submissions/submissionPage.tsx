import { Flex, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';
import type { User } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import type { Metadata } from 'unfurl.js/dist/types';

import TalentBio from '@/components/TalentBio';

import { Comments } from '../comments';

interface Props {
  user: User;
  link: string;
}
export const SubmissionPage = ({ user, link }: Props) => {
  const router = useRouter();
  const [image, setImage] = useState<string>('/assets/bg/og.svg');

  useEffect(() => {
    const fetchImage = async () => {
      if (link) {
        try {
          const { data } = (await axios.post('/api/og', {
            url: link,
          })) as { data: Metadata };
          setImage(data.open_graph.images![0]?.url ?? '/assets/bg/og.svg');
        } catch (error) {
          console.log(error);
          setImage('/assets/bg/og.svg');
        }
      }
    };
    fetchImage();
  }, []);
  return (
    <VStack
      align={['center', 'center', 'start', 'start']}
      justify={['center', 'center', 'space-between', 'space-between']}
      flexDir={['column-reverse', 'column-reverse', 'row', 'row']}
      gap={4}
      w="full"
      maxW={'7xl'}
      mx={'auto'}
    >
      <VStack gap={8} w={'full'} mt={3}>
        <VStack w={'full'} h={'40rem'} bg={'white'} rounded={'md'}>
          <Flex justify={'space-between'} w={'full'} mt={5} px={8}>
            <Text color={'black'} fontSize={'22px'} fontWeight={600}>
              {user?.firstName}’s Submission
            </Text>
            {/* <Button
              zIndex={10}
              alignItems={'center'}
              gap={2}
              display={'flex'}
              w={14}
              border={'1px solid #CBD5E1'}
              variant={'unstyled'}
            >
              <AiFillHeart />
              {likes?.length}
            </Button> */}
          </Flex>
          <Image
            w={'full'}
            h={'30rem'}
            p={7}
            objectFit={'cover'}
            alt={'submission'}
            rounded={'2rem'}
            src={image}
          />
          <HStack w="full" px={7}>
            <Link
              px={5}
              py={2}
              border="1px solid"
              borderColor={'gray.400'}
              borderRadius={5}
              href={link}
              isExternal
            >
              Visit Link
            </Link>
          </HStack>
        </VStack>
        <Comments
          refId={(router.query.subid as string) ?? ''}
          refType="BOUNTY"
        />
      </VStack>
      <VStack w={['100%', '100%', '36rem', '36rem']}>
        <TalentBio successPage={false} user={user} />
      </VStack>
    </VStack>
  );
};
