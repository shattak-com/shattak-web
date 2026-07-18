'use client';

import { Box, Text } from '@chakra-ui/react';
import { useEffect, useId, useRef, useState } from 'react';

type MermaidDiagramProps = {
	chart: string;
};

export const MermaidDiagram = ({ chart }: MermaidDiagramProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const renderId = useId().replace(/[^a-zA-Z0-9-_]/g, '');
	const [error, setError] = useState('');
	const [isRendering, setIsRendering] = useState(true);

	useEffect(() => {
		let isCancelled = false;
		const container = containerRef.current;

		if (!container || !chart.trim()) {
			setError('This Mermaid diagram is empty.');
			setIsRendering(false);

			return undefined;
		}

		const renderDiagram = async () => {
			setError('');
			setIsRendering(true);

			try {
				const { default: mermaid } = await import('mermaid');
				const isDarkMode = document.documentElement.classList.contains('dark');

				mermaid.initialize({
					startOnLoad: false,
					securityLevel: 'strict',
					suppressErrorRendering: true,
					theme: isDarkMode ? 'dark' : 'default'
				});

				const { svg, bindFunctions } = await mermaid.render(`lesson-mermaid-${renderId}`, chart);

				if (isCancelled || !containerRef.current) {
					return;
				}

				containerRef.current.innerHTML = svg;
				bindFunctions?.(containerRef.current);
			} catch {
				if (!isCancelled) {
					container.innerHTML = '';
					setError('This Mermaid diagram could not be rendered. Check its syntax and try again.');
				}
			} finally {
				if (!isCancelled) {
					setIsRendering(false);
				}
			}
		};

		renderDiagram();

		return () => {
			isCancelled = true;
			container.innerHTML = '';
		};
	}, [chart, renderId]);

	return (
		<Box
			border="1px solid"
			borderColor="border.default"
			borderRadius="lg"
			bg="bg.card"
			my={4}
			overflowX="auto"
			p={{ base: 3, md: 5 }}
		>
			{isRendering ? (
				<Text color="text.muted" fontSize="sm">
					Rendering diagram...
				</Text>
			) : null}
			{error ? (
				<Text color="red.500" fontSize="sm" role="alert">
					{error}
				</Text>
			) : null}
			<Box
				ref={containerRef}
				role="img"
				aria-label="Mermaid diagram"
				css={{
					'& svg': {
						display: 'block',
						height: 'auto',
						margin: '0 auto',
						maxWidth: '100%'
					}
				}}
			/>
		</Box>
	);
};
