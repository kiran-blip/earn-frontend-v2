import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  InfoOutlineIcon,
  SearchIcon,
  ViewIcon,
  ViewOffIcon,
} from '@chakra-ui/icons';
import {
  Button,
  Flex,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineEdit, AiOutlineOrderedList } from 'react-icons/ai';
import { FiMoreVertical } from 'react-icons/fi';

import ErrorSection from '@/components/shared/ErrorSection';
import LoadingSection from '@/components/shared/LoadingSection';
import { tokenList } from '@/constants/index';
import type { Bounty } from '@/interface/bounty';
import Sidebar from '@/layouts/Sidebar';
import { userStore } from '@/store/user';
import { dayjs } from '@/utils/dayjs';

const debounce = require('lodash.debounce');

function Bounties() {
  const router = useRouter();
  const {
    isOpen: publishIsOpen,
    onOpen: publishOnOpen,
    onClose: publishOnClose,
  } = useDisclosure();
  const {
    isOpen: unpublishIsOpen,
    onOpen: unpublishOnOpen,
    onClose: unpublishOnClose,
  } = useDisclosure();
  const { userInfo } = userStore();
  const [totalBounties, setTotalBounties] = useState(0);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [bounty, setBounty] = useState<Bounty>({});
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isBountiesLoading, setIsBountiesLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [skip, setSkip] = useState(0);
  const length = 15;

  const debouncedSetSearchText = useRef(debounce(setSearchText, 300)).current;

  useEffect(() => {
    return () => {
      debouncedSetSearchText.cancel();
    };
  }, [debouncedSetSearchText]);

  const getBounties = async () => {
    setIsBountiesLoading(true);
    try {
      const bountiesList = await axios.get('/api/bounties/', {
        params: {
          sponsorId: userInfo?.currentSponsorId,
          searchText,
          skip,
          take: length,
        },
      });
      setTotalBounties(bountiesList.data.total);
      setBounties(bountiesList.data.data);
      setIsBountiesLoading(false);
    } catch (error) {
      setIsBountiesLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.currentSponsorId) {
      getBounties();
    }
  }, [userInfo?.currentSponsorId, skip, searchText]);

  const getBgColor = (status: String) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const handlePublish = async (publishedBounty: Bounty) => {
    console.log(
      'file: index.tsx:105 ~ handlePublish ~ bounty:',
      publishedBounty
    );
    setBounty(publishedBounty);
    publishOnOpen();
  };

  const handleUnpublish = async (unpublishedBounty: Bounty) => {
    console.log(
      'file: index.tsx:105 ~ handleUnpublish ~ bounty:',
      unpublishedBounty
    );
    setBounty(unpublishedBounty);
    unpublishOnOpen();
  };

  const changeBountyStatus = async (status: boolean) => {
    setIsChangingStatus(true);
    try {
      const result = await axios.post(`/api/bounties/update/${bounty.id}/`, {
        isPublished: status,
      });
      console.log('file: index.tsx:147 ~ changeBountyStatus ~ result:', result);
      const changedBountyIndex = bounties.findIndex(
        (b) => b.id === result.data.id
      );
      console.log(
        'file: index.tsx:150 ~ changeBountyStatus ~ changedBountyIndex:',
        changedBountyIndex
      );
      const newBounties = bounties.map((b, index) =>
        changedBountyIndex === index
          ? { ...b, isPublished: result.data.isPublished }
          : b
      );
      setBounties(newBounties);
      publishOnClose();
      unpublishOnClose();
      setIsChangingStatus(false);
    } catch (e) {
      setIsChangingStatus(false);
      console.log('file: index.tsx:149 ~ changeBountyStatus ~ e:', e);
    }
  };

  return (
    <Sidebar>
      <Modal isOpen={publishIsOpen} onClose={publishOnClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Publish Bounty?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="brand.slate.500">
              All talent will be able to see this bounty once published. Are you
              sure you want to publish?
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button mr={4} onClick={publishOnClose} variant="ghost">
              Close
            </Button>
            <Button
              isLoading={isChangingStatus}
              leftIcon={<ViewIcon />}
              loadingText="Publishing..."
              onClick={() => changeBountyStatus(true)}
              variant="solid"
            >
              Publish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={unpublishIsOpen} onClose={unpublishOnClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unpublish Bounty?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="brand.slate.500">
              No talent will be able to see this bounty once unpublished. Are
              you sure you want to unpublish?
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button mr={4} onClick={unpublishOnClose} variant="ghost">
              Close
            </Button>
            <Button
              isLoading={isChangingStatus}
              leftIcon={<ViewOffIcon />}
              loadingText="Unpublishing..."
              onClick={() => changeBountyStatus(false)}
              variant="solid"
            >
              Unpublish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Flex justify="between" mb={4}>
        <InputGroup w={52}>
          <Input
            bg={'white'}
            borderColor="brand.slate.400"
            _placeholder={{
              color: 'brand.slate.400',
            }}
            focusBorderColor="brand.purple"
            onChange={(e) => debouncedSetSearchText(e.target.value)}
            placeholder="Search bounties..."
            type="text"
          />
          <InputRightElement pointerEvents="none">
            <SearchIcon color="brand.slate.400" />
          </InputRightElement>
        </InputGroup>
      </Flex>
      {isBountiesLoading && <LoadingSection />}
      {!isBountiesLoading && !bounties?.length && (
        <ErrorSection
          title="No bounties found!"
          message="Create new bounty from the sidebar"
        />
      )}
      {!isBountiesLoading && bounties?.length && (
        <TableContainer mb={8}>
          <Table
            border="1px solid"
            borderColor={'blackAlpha.200'}
            variant="simple"
          >
            <Thead>
              <Tr bg="white">
                <Th
                  maxW={96}
                  color="brand.slate.400"
                  fontSize="sm"
                  fontWeight={500}
                  textTransform={'capitalize'}
                >
                  Bounty Name
                </Th>
                <Th
                  align="center"
                  color="brand.slate.400"
                  fontSize="sm"
                  fontWeight={500}
                  textAlign="center"
                  textTransform={'capitalize'}
                >
                  Deadline
                </Th>
                <Th
                  color="brand.slate.400"
                  fontSize="sm"
                  fontWeight={500}
                  textTransform={'capitalize'}
                >
                  Prize
                </Th>
                <Th
                  color="brand.slate.400"
                  fontSize="sm"
                  fontWeight={500}
                  textAlign="center"
                  textTransform={'capitalize'}
                >
                  Status
                </Th>
                <Th
                  color="brand.slate.400"
                  fontSize="sm"
                  fontWeight={500}
                  textTransform={'capitalize'}
                />
                <Th
                  color="brand.slate.400"
                  fontSize="sm"
                  fontWeight={500}
                  textTransform={'capitalize'}
                />
              </Tr>
            </Thead>
            <Tbody w="full">
              {bounties.map((currentBounty) => {
                const deadlineFromNow = currentBounty?.deadline
                  ? dayjs(currentBounty.deadline).fromNow()
                  : '-';
                const deadline = currentBounty?.deadline
                  ? dayjs(currentBounty.deadline).format('MMM D, YYYY HH:mm')
                  : '-';
                const bountyStatus =
                  // eslint-disable-next-line no-nested-ternary
                  currentBounty.status === 'OPEN'
                    ? currentBounty.isPublished
                      ? 'PUBLISHED'
                      : 'DRAFT'
                    : 'CLOSED';
                return (
                  <Tr key={currentBounty?.id} bg="white">
                    <Td
                      maxW={96}
                      color="brand.slate.600"
                      fontWeight={700}
                      whiteSpace="normal"
                    >
                      {currentBounty.title}
                    </Td>
                    <Td align="center">
                      <Flex align={'center'} justify="center">
                        <Tooltip
                          color="white"
                          bg="brand.purple"
                          label={deadline}
                          placement="bottom"
                        >
                          <Flex align="center">
                            {deadlineFromNow}
                            <InfoOutlineIcon
                              ml={1}
                              w={3}
                              h={3}
                              color="brand.slate.400"
                            />
                          </Flex>
                        </Tooltip>
                      </Flex>
                    </Td>
                    <Td>
                      <Flex align={'center'} justify={'start'}>
                        <Image
                          w={5}
                          h="auto"
                          mr={2}
                          alt={'green doller'}
                          rounded={'full'}
                          src={
                            tokenList.filter(
                              (e) => e?.tokenName === currentBounty.token
                            )[0]?.icon ?? '/assets/icons/green-doller.svg'
                          }
                        />
                        <Text color="brand.slate.400">
                          {(currentBounty.rewardAmount || 0).toLocaleString(
                            'en-US'
                          )}
                        </Text>
                      </Flex>
                    </Td>
                    <Td align="center">
                      <Flex align="center" justify={'center'}>
                        <Tag
                          color={'white'}
                          bg={getBgColor(bountyStatus)}
                          variant="solid"
                        >
                          {bountyStatus}
                        </Tag>
                      </Flex>
                    </Td>
                    <Td>
                      {currentBounty.status === 'OPEN' &&
                        currentBounty.isPublished && (
                          <Button
                            w="full"
                            leftIcon={<ViewOffIcon />}
                            onClick={() => handleUnpublish(currentBounty)}
                            size="sm"
                            variant="outline"
                          >
                            Unpublish
                          </Button>
                        )}
                      {currentBounty.status === 'OPEN' &&
                        !currentBounty.isPublished && (
                          <Button
                            w="full"
                            leftIcon={<ViewIcon />}
                            onClick={() => handlePublish(currentBounty)}
                            size="sm"
                            variant="outline"
                          >
                            Publish
                          </Button>
                        )}
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          border="none"
                          aria-label="Options"
                          icon={<FiMoreVertical />}
                          variant="outline"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<ExternalLinkIcon />}
                            onClick={() =>
                              window.open(
                                `${router.basePath}/listings/bounties/${currentBounty.slug}`,
                                '_ blank'
                              )
                            }
                          >
                            View Bounty
                          </MenuItem>
                          <MenuDivider />
                          <NextLink
                            href={`/dashboard/bounties/${currentBounty.slug}/edit/`}
                            passHref
                          >
                            <MenuItem icon={<AiOutlineEdit />}>
                              Edit Bounty
                            </MenuItem>
                          </NextLink>
                          <MenuDivider />
                          <NextLink
                            href={`/dashboard/bounties/${currentBounty.slug}/submissions/`}
                            passHref
                          >
                            <MenuItem icon={<AiOutlineOrderedList />}>
                              View Submissions
                            </MenuItem>
                          </NextLink>
                          {/* <MenuItem icon={<AiOutlineEdit />}>Edit Bounty</MenuItem> */}
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      <Flex align="center" justify="end" mt={6}>
        <Text mr={4} color="brand.slate.400" fontSize="sm">
          <Text as="span" fontWeight={700}>
            {skip + 1}
          </Text>{' '}
          -{' '}
          <Text as="span" fontWeight={700}>
            {Math.min(skip + length, totalBounties)}
          </Text>{' '}
          of{' '}
          <Text as="span" fontWeight={700}>
            {totalBounties}
          </Text>{' '}
          Bounties
        </Text>
        <Button
          mr={4}
          isDisabled={skip <= 0}
          leftIcon={<ChevronLeftIcon w={5} h={5} />}
          onClick={() => (skip >= length ? setSkip(skip - length) : setSkip(0))}
          size="sm"
          variant="outline"
        >
          Previous
        </Button>
        <Button
          isDisabled={
            totalBounties < skip + length || (skip > 0 && skip % length !== 0)
          }
          onClick={() => skip % length === 0 && setSkip(skip + length)}
          rightIcon={<ChevronRightIcon w={5} h={5} />}
          size="sm"
          variant="outline"
        >
          Next
        </Button>
      </Flex>
    </Sidebar>
  );
}

export default Bounties;
