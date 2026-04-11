/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 记忆类型颜色
        episodic: '#3B82F6',
        semantic: '#FBBF24',
        procedural: '#10B981',
        persona: '#8B5CF6',
        
        // 情感颜色
        joy: '#FBBF24',
        sadness: '#3B82F6',
        fear: '#10B981',
        anger: '#EF4444',
        disgust: '#84CC16',
        
        // 背景色
        'wall-bg': '#0F172A',
        'shelf-bg': '#1E293B',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.6' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(251, 191, 36, 0.5)',
        'glow-strong': '0 0 40px rgba(251, 191, 36, 0.8)',
      },
    },
  },
  plugins: [],
}
