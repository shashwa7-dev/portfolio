// Console styling
const styles = {
  title: [
    "font-weight: bold",
    "font-size: 40px",
    "color: #FF6B6B",
    "text-shadow: 2px 2px 4px rgba(0,0,0,0.3)",
  ].join(";"),
  subtitle: ["color: #4ECDC4", "font-size: 16px", "font-weight: bold"].join(
    ";"
  ),
  text: ["color: #95A5A6", "font-size: 14px"].join(";"),
};

// ASCII art logo
console.log(`
███████╗███████╗██████╗ ███████╗██╗   ██╗
██╔════╝╚════██║██╔══██╗██╔════╝██║   ██║
███████╗    ██╔╝██║  ██║█████╗  ██║   ██║
╚════██║   ██╔╝ ██║  ██║██╔══╝  ╚██╗ ██╔╝
███████║   ██║  ██████╔╝███████╗ ╚████╔╝ 
╚══════╝   ╚═╝  ╚═════╝ ╚══════╝  ╚═══╝
`);

console.log("%cHey there, curious developer! 👋", styles.title);
console.log("%cWelcome to my digital playground", styles.subtitle);

console.log("%c\n👨‍💻 A bit about me:", styles.subtitle);
console.log(
  "%cI craft pixels into experiences and turn coffee into code. Frontend engineer by day, problem solver by nature.",
  styles.text
);

console.log("%c\n🛠 Tech Stack:", styles.subtitle);
console.log(
  "%cReact • Next.js • TypeScript • Tailwind CSS • And a sprinkle of magic ✨",
  styles.text
);

console.log("%c\n💡 Fun fact:", styles.subtitle);
console.log(
  "%cI don't always test my code, but when I do, I do it in production. (Just kidding, please don't do this!)",
  styles.text
);

console.log(
  `
%c⚡️ Want to collaborate or just chat about code? 
🌐 Find me at: shashwa7.in
📧 Email: contact@shashwa7.in
`,
  styles.text
);

// Easter egg
const secretMessage = `
🕵️‍♂️ AHA! Caught you snooping in the console!
(Don't worry, curiosity didn't kill the developer... usually)

🎮 Since you're here, let's play a little game:

⌨️ SECRET CHEAT CODES UNLOCKED:
↑↓→ : Opens my LinkedIn (where I pretend to be professional)
←/→ : Opens my GitHub (where my code is *definitely* bug-free... trust me)

🤫 Keep this between us, but...
There might be more secrets hidden in the code.
Or maybe I'm just making you check every file...
*evil developer laugh* 

P.S. If anyone asks, you "inspected element" for responsive design purposes 😉
`;

console.log("%c\n🎯 Bonus Quest:", styles.subtitle);
console.log(`%c${secretMessage}`, styles.text);

// Performance metrics (just for fun)
console.log("%c\n⚡️ Page Load Stats:", styles.subtitle);
console.log("%cCoffee consumed while coding: ☕️☕️☕️", styles.text);
console.log("%cPixels aligned: Precisely", styles.text);
console.log("%cBugs squashed: Too many to count 🐛", styles.text);
