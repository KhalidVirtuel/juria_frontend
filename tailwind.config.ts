import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				'border-glass': 'hsla(var(--glass-border))', 
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				'background-glass': 'hsla(var(--background-glass))',
				'background-blur': 'hsla(var(--background-blur))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glass: 'hsla(var(--primary-glass))',
					glow: 'hsla(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					glass: 'hsla(var(--secondary-glass))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					glass: 'hsla(var(--accent-glass))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					glass: 'hsla(var(--card-glass))',
					border: 'hsla(var(--card-border))'
				},
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				// Chrome metallic colors
				chrome: {
					50: 'hsl(var(--chrome-50))',
					100: 'hsl(var(--chrome-100))',
					200: 'hsl(var(--chrome-200))',
					300: 'hsl(var(--chrome-300))',
					400: 'hsl(var(--chrome-400))',
					500: 'hsl(var(--chrome-500))',
					600: 'hsl(var(--chrome-600))',
					700: 'hsl(var(--chrome-700))',
					800: 'hsl(var(--chrome-800))',
					900: 'hsl(var(--chrome-900))'
				},
				// Blue-gray accents
				'blue-gray': {
					DEFAULT: 'hsl(var(--blue-gray))',
					glow: 'hsla(var(--blue-gray-glow))'
				},
				// Premium glass surfaces
				glass: {
					DEFAULT: 'hsla(var(--glass))',
					light: 'rgba(255, 255, 255, 0.8)',
					dark: 'rgba(255, 255, 255, 0.5)',
					chrome: 'hsla(var(--primary-glass))',
					metal: 'hsla(var(--surface-metal))'
				}
			},
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
				display: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'sans-serif'],
				mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'Consolas', 'monospace'],
				onest: ['Onest', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'var(--radius-xl)',
				'2xl': '1.5rem',
				'3xl': '2rem'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-light': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'colorReveal': {
					'0%': { color: 'rgb(209, 213, 219)' },  // text-gray-300
					'100%': { color: 'currentColor' }
				},
				'fadeIn': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scrollReveal': {
					'0%': { 
						color: 'rgb(209, 213, 219)',  // text-gray-300
						opacity: '0.7',
						transform: 'translateY(20px)'
					},
					'100%': { 
						color: 'currentColor',
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-light': 'pulse-light 2s ease-in-out infinite',
				'colorReveal': 'colorReveal 4s ease-in-out forwards',
				'fadeIn': 'fadeIn 1s ease-in-out forwards',
				'scroll-reveal': 'scrollReveal 0.8s ease-out forwards'
			},
			boxShadow: {
				'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
				'apple-metal': '0 4px 24px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.7)',
				'apple-chrome': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
				'apple-floating': '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
				'apple-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.18), 0 4px 16px -2px rgba(0, 0, 0, 0.08)',
				'apple-active': '0 2px 8px 0 rgba(0, 0, 0, 0.1), inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
				'glow': '0 0 40px rgba(59, 130, 246, 0.4)',
				'glow-lg': '0 0 60px rgba(59, 130, 246, 0.6)',
			},
			backdropBlur: {
				xs: '2px',
				'3xl': '64px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;