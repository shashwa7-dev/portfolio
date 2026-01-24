# Portfolio Website

A modern, aesthetic portfolio website built with Next.js, featuring smooth animations, a clean design, and an AI-powered chatbot. This project showcases projects, work experience, tech stack, and blog posts.

## Features

- **Modern UI/UX** - Clean, minimalist design with smooth animations
- **Fully Responsive** - Optimized for all device sizes
- **AI Chatbot** - Interactive chatbot powered by Google Gemini
- **Blog System** - MDX-based blog with syntax highlighting
- **Project Showcase** - Detailed project pages with previews
- **Work Experience** - Timeline of professional experience
- **Tech Stack Display** - Interactive tech stack visualization
- **Dark Theme** - Beautiful dark theme with e-ink inspired colors
- **Performance Optimized** - Fast loading with Next.js optimizations

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- npm, yarn, pnpm, or bun

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/my-portfolio.git
cd my-portfolio
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables (if needed):
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Motion (Framer Motion)
- **UI Components**: Radix UI, Shadcn/ui
- **Icons**: Feather Icons React
- **Content**: MDX for blog posts
- **Deployment**: Vercel

## Project Structure

```
my-portfolio/
├── app/                    # Next.js app directory
│   ├── blogs/             # Blog posts
│   ├── work/              # Work experience pages
│   ├── project/           # Project detail pages
│   └── ...
├── components/            # React components
│   ├── common/           # Shared components
│   └── ui/               # UI components
├── lib/                   # Utility functions and data
├── public/                # Static assets
└── ...
```

## Customization

### Update Personal Information

1. Edit `components/About.tsx` for your bio
2. Update `lib/workData.ts` for work experience
3. Modify `lib/projectsData.ts` for your projects
4. Update `app/layout.tsx` for metadata

### Styling

The project uses Tailwind CSS with custom design tokens. Colors and themes can be customized in:
- `app/globals.css` - CSS variables and theme colors
- `tailwind.config.ts` - Tailwind configuration

### Adding Blog Posts

Create MDX files in `app/blogs/posts/` following the existing format.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Feather Icons](https://feathericons.com/)
- Animations powered by [Motion](https://motion.dev/)

## Contact

For questions or suggestions, feel free to reach out!

---

**Note**: This is an open-source portfolio template. Feel free to fork, modify, and use it for your own portfolio!
