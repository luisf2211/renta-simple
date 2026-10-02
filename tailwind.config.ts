import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Chakra UI handles most component styling; Tailwind is used for utility
  // classes and print layout. Disable preflight to avoid clashing with Chakra's reset.
  corePlugins: {
    preflight: false,
  },
};

export default config;
