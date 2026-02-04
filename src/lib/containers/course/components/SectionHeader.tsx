import { Heading, Stack, Text } from '@chakra-ui/react';

type SectionHeaderProps = {
	title: string;
	subtitle?: string;
};

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
	<Stack spacing={2}>
		<Heading fontSize={{ base: 'xl', md: '2xl' }} lineHeight="title" letterSpacing="subtle">
			{title}
		</Heading>
		{subtitle ? (
			<Text color="text.muted" fontSize={{ base: 'sm', md: 'md' }}>
				{subtitle}
			</Text>
		) : null}
	</Stack>
);

export default SectionHeader;
