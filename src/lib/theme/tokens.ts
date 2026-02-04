import { defineSemanticTokens, defineTokens } from '@chakra-ui/react';

export const tokens = defineTokens({
	colors: {
		brand: {
			50: { value: '#FFF1ED' },
			100: { value: '#FFD7CF' },
			300: { value: '#FF8A7A' },
			400: { value: '#FF8A7A' },
			500: { value: '#FF6B57' },
			600: { value: '#E55B49' }
		},
		accent: {
			300: { value: '#4E78FF' },
			400: { value: '#4E78FF' },
			500: { value: '#4E78FF' }
		},
		ink: {
			800: { value: '#2B2B2B' },
			900: { value: '#111111' },
			950: { value: '#0F0F0F' }
		},
		surface: {
			50: { value: '#F9FAFB' },
			100: { value: '#FFF6F3' },
			200: { value: '#FFF9F7' },
			300: { value: '#F3F7FF' },
			400: { value: '#F5FFF3' },
			500: { value: '#F2F4FF' }
		},
		success: {
			500: { value: '#25D366' }
		},
		warning: {
			500: { value: '#FFB347' }
		},
		overlay: {
			8: { value: 'rgba(255, 255, 255, 0.08)' },
			15: { value: 'rgba(255, 255, 255, 0.15)' },
			70: { value: 'rgba(255, 255, 255, 0.7)' },
			80: { value: 'rgba(255, 255, 255, 0.8)' },
			90: { value: 'rgba(255, 255, 255, 0.9)' },
			92: { value: 'rgba(255, 255, 255, 0.92)' }
		},
		overlayDark: {
			40: { value: 'rgba(17, 24, 39, 0.4)' },
			60: { value: 'rgba(17, 24, 39, 0.6)' },
			92: { value: 'rgba(17, 24, 39, 0.92)' }
		},
		brandAlpha: {
			20: { value: 'rgba(255, 107, 87, 0.2)' },
			25: { value: 'rgba(255, 107, 87, 0.25)' },
			28: { value: 'rgba(255, 107, 87, 0.28)' },
			40: { value: 'rgba(255, 107, 87, 0.4)' }
		},
		accentAlpha: {
			18: { value: 'rgba(78, 120, 255, 0.18)' },
			20: { value: 'rgba(78, 120, 255, 0.2)' },
			35: { value: 'rgba(78, 120, 255, 0.35)' },
			22: { value: 'rgba(78, 120, 255, 0.22)' }
		},
		inkAlpha: {
			5: { value: 'rgba(0, 0, 0, 0.05)' },
			10: { value: 'rgba(0, 0, 0, 0.1)' }
		}
	},
	radii: {
		card: { value: '24px' },
		panel: { value: '20px' },
		surface: { value: '32px' },
		soft: { value: '12px' },
		tile: { value: '16px' }
	},
	shadows: {
		card: { value: '0 16px 36px rgba(15, 23, 42, 0.12)' },
		soft: { value: '0 8px 20px rgba(15, 23, 42, 0.14)' },
		elevated: { value: '0 22px 48px rgba(15, 23, 42, 0.12)' },
		float: { value: '0 10px 30px rgba(0, 0, 0, 0.16)' },
		hero: { value: '0 36px 72px rgba(17, 24, 39, 0.18)' },
		primary: { value: '0 8px 20px rgba(255, 107, 87, 0.28)' },
		primaryHover: { value: '0 14px 30px rgba(255, 107, 87, 0.36)' },
		neutral: { value: '0 8px 20px rgba(0, 0, 0, 0.08)' },
		neutralHover: { value: '0 14px 30px rgba(0, 0, 0, 0.14)' },
		badge: { value: '0 10px 26px rgba(0, 0, 0, 0.14)' },
		glow: { value: '0 26px 70px rgba(78, 120, 255, 0.12)' },
		brandSoft: { value: '0 6px 16px rgba(255, 107, 87, 0.14)' },
		accentSoft: { value: '0 6px 16px rgba(78, 120, 255, 0.14)' }
	},
	fonts: {
		body: { value: 'var(--font-body)' },
		heading: { value: 'var(--font-heading)' },
		display: { value: "'Google Sans', var(--font-body)" }
	},
	lineHeights: {
		display: { value: '1.15' },
		title: { value: '1.2' },
		compact: { value: '1.35' },
		banner: { value: '1.4' },
		body: { value: '1.6' },
		relaxed: { value: '1.7' }
	},
	letterSpacings: {
		tight: { value: '-0.5px' },
		subtle: { value: '-0.01em' }
	},
	fontWeights: {
		normal: { value: '400' },
		medium: { value: '500' },
		semibold: { value: '600' },
		bold: { value: '700' }
	},
	gradients: {
		brandSunset: { value: 'linear-gradient(135deg, #FF6B57 0%, #FF8A7A 100%)' },
		brandAccent: { value: 'linear-gradient(135deg, #FF6B57 0%, #4E78FF 100%)' },
		heroWarmOrb: { value: 'radial-gradient(circle at 30% 30%, rgba(255, 107, 87, 0.28), rgba(255, 107, 87, 0))' },
		heroWarmOrbDark: { value: 'radial-gradient(circle at 30% 30%, rgba(255, 107, 87, 0.16), rgba(255, 107, 87, 0))' },
		heroCoolOrb: { value: 'radial-gradient(circle at 60% 40%, rgba(78, 120, 255, 0.18), rgba(78, 120, 255, 0))' },
		heroCoolOrbDark: { value: 'radial-gradient(circle at 60% 40%, rgba(78, 120, 255, 0.12), rgba(78, 120, 255, 0))' },
		ctaWarmOrb: { value: 'radial-gradient(circle at 30% 30%, rgba(255, 107, 87, 0.25), rgba(255, 107, 87, 0))' },
		ctaWarmOrbDark: { value: 'radial-gradient(circle at 30% 30%, rgba(255, 107, 87, 0.16), rgba(255, 107, 87, 0))' },
		ctaCoolOrb: { value: 'radial-gradient(circle at 60% 40%, rgba(78, 120, 255, 0.22), rgba(78, 120, 255, 0))' },
		ctaCoolOrbDark: { value: 'radial-gradient(circle at 60% 40%, rgba(78, 120, 255, 0.14), rgba(78, 120, 255, 0))' },
		ctaSurface: { value: 'linear-gradient(135deg, #F2F4FF 0%, #FFF6F3 100%)' },
		ctaSurfaceDark: { value: 'linear-gradient(135deg, rgba(17, 24, 39, 0.92) 0%, rgba(15, 23, 42, 0.86) 100%)' },
		shimmer: { value: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent)' },
		heroGlow: { value: 'radial-gradient(circle, rgba(255, 107, 87, 0.2), transparent 70%)' },
		heroGlowDark: { value: 'radial-gradient(circle, rgba(255, 107, 87, 0.12), transparent 70%)' },
		instructorGlow: { value: 'radial-gradient(circle, rgba(78, 120, 255, 0.15), transparent 70%)' },
		instructorGlowDark: { value: 'radial-gradient(circle, rgba(78, 120, 255, 0.1), transparent 70%)' }
	}
});

export const semanticTokens = defineSemanticTokens({
	colors: {
		bg: {
			canvas: { value: { _light: '{colors.white}', _dark: '{colors.gray.950}' } },
			surface: { value: { _light: '{colors.surface.50}', _dark: '{colors.gray.900}' } },
			subtle: { value: { _light: '{colors.surface.100}', _dark: '{colors.gray.800}' } },
			card: { value: { _light: '{colors.white}', _dark: '{colors.gray.900}' } },
			accent: { value: { _light: '{colors.surface.300}', _dark: '{colors.gray.800}' } },
			success: { value: { _light: '{colors.surface.400}', _dark: '{colors.gray.800}' } },
			brand: { value: { _light: '{colors.brand.50}', _dark: '{colors.brand.600}' } },
			header: { value: { _light: '{colors.overlay.92}', _dark: '{colors.overlayDark.92}' } },
			inverse: { value: { _light: '{colors.ink.900}', _dark: '{colors.gray.100}' } },
			inverseHover: { value: { _light: '{colors.ink.800}', _dark: '{colors.white}' } },
			glass: { value: { _light: '{colors.overlay.90}', _dark: '{colors.overlayDark.60}' } },
			glassSoft: { value: { _light: '{colors.overlay.70}', _dark: '{colors.overlayDark.40}' } },
			badge: { value: { _light: '{colors.gray.700}', _dark: '{colors.gray.500}' } },
			badgeStrong: { value: { _light: '{colors.gray.900}', _dark: '{colors.gray.200}' } },
			footer: { value: { _light: '{colors.ink.950}', _dark: '{colors.gray.950}' } }
		},
		text: {
			primary: { value: { _light: '{colors.ink.900}', _dark: '{colors.gray.100}' } },
			secondary: { value: { _light: '{colors.gray.700}', _dark: '{colors.gray.300}' } },
			muted: { value: { _light: '{colors.gray.600}', _dark: '{colors.gray.400}' } },
			inverse: { value: { _light: '{colors.white}', _dark: '{colors.gray.900}' } },
			onDark: { value: { _light: '{colors.white}', _dark: '{colors.white}' } },
			onDarkMuted: { value: { _light: '{colors.whiteAlpha.700}', _dark: '{colors.whiteAlpha.700}' } },
			onDarkSubtle: { value: { _light: '{colors.whiteAlpha.500}', _dark: '{colors.whiteAlpha.500}' } },
			brand: { value: { _light: '{colors.brand.500}', _dark: '{colors.brand.400}' } },
			accent: { value: { _light: '{colors.accent.500}', _dark: '{colors.accent.400}' } }
		},
		border: {
			default: { value: { _light: '{colors.gray.100}', _dark: '{colors.gray.800}' } },
			muted: { value: { _light: '{colors.gray.200}', _dark: '{colors.gray.700}' } },
			brand: { value: { _light: '{colors.brand.500}', _dark: '{colors.brand.400}' } },
			brandSoft: { value: { _light: '{colors.brandAlpha.20}', _dark: '{colors.brandAlpha.40}' } },
			accent: { value: { _light: '{colors.accent.500}', _dark: '{colors.accent.400}' } },
			accentSoft: { value: { _light: '{colors.accentAlpha.20}', _dark: '{colors.accentAlpha.35}' } },
			subtle: { value: { _light: '{colors.inkAlpha.5}', _dark: '{colors.overlay.8}' } },
			glass: { value: { _light: '{colors.overlay.80}', _dark: '{colors.overlay.15}' } },
			onDark: { value: { _light: '{colors.whiteAlpha.300}', _dark: '{colors.whiteAlpha.300}' } }
		},
		icon: {
			brand: { value: { _light: '{colors.brand.500}', _dark: '{colors.brand.300}' } },
			accent: { value: { _light: '{colors.accent.500}', _dark: '{colors.accent.300}' } },
			warning: { value: { _light: '{colors.warning.500}', _dark: '{colors.warning.400}' } },
			success: { value: { _light: '{colors.success.500}', _dark: '{colors.success.400}' } },
			inverse: { value: { _light: '{colors.white}', _dark: '{colors.gray.900}' } }
		},
		primary: { value: { _light: '{colors.brand.500}', _dark: '{colors.brand.400}' } },
		primaryHover: { value: { _light: '{colors.brand.600}', _dark: '{colors.brand.300}' } },
		accent: { value: { _light: '{colors.accent.500}', _dark: '{colors.accent.400}' } }
	},
	shadows: {
		card: { value: { _light: '{shadows.card}', _dark: '{shadows.card}' } },
		soft: { value: { _light: '{shadows.soft}', _dark: '{shadows.soft}' } },
		elevated: { value: { _light: '{shadows.elevated}', _dark: '{shadows.elevated}' } },
		float: { value: { _light: '{shadows.float}', _dark: '{shadows.float}' } },
		hero: { value: { _light: '{shadows.hero}', _dark: '{shadows.hero}' } },
		primary: { value: { _light: '{shadows.primary}', _dark: '{shadows.primary}' } },
		primaryHover: { value: { _light: '{shadows.primaryHover}', _dark: '{shadows.primaryHover}' } },
		neutral: { value: { _light: '{shadows.neutral}', _dark: '{shadows.neutral}' } },
		neutralHover: { value: { _light: '{shadows.neutralHover}', _dark: '{shadows.neutralHover}' } },
		badge: { value: { _light: '{shadows.badge}', _dark: '{shadows.badge}' } },
		glow: { value: { _light: '{shadows.glow}', _dark: '{shadows.glow}' } },
		brandSoft: { value: { _light: '{shadows.brandSoft}', _dark: '{shadows.brandSoft}' } },
		accentSoft: { value: { _light: '{shadows.accentSoft}', _dark: '{shadows.accentSoft}' } }
	}
});
