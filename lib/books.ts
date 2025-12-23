export type Chapter = {
  id: string;
  title: string;
  completed: boolean;
};
export type Book = {
  slug: string;
  name: string;
  link: string;
  description?: string;
  author: string;
  cover: string;
  isDone: boolean;
  chapters: Chapter[];
};

export const books: Book[] = [
  //   {
  //     slug: "build-a-llm",
  //     name: "Build a LLM",
  //     author: "Sebastian Raschka",
  //     cover: "/books/book_build_LLM.JPG",
  //     isDone: false,
  //     chapters: [
  //       { id: "ch1", title: "Introduction to LLMs", completed: false },
  //       { id: "ch2", title: "Tokenization", completed: false },
  //       { id: "ch3", title: "Transformer Architecture", completed: false },
  //     ],
  //   },

  {
    slug: "advanced-react",
    name: "Advanced React",
    link: "https://www.advanced-react.com/",
    description: `Take your React knowledge to the next level with advanced concepts, strategies, techniques, patterns and in-depth investigations.`,
    author: "Nadia Makarevich",
    cover: "/books/book_advnc_react.JPG",
    isDone: false,
    chapters: [
      {
        id: "ch0",
        title: "Introduction: How to Read This Book",
        completed: true,
      },

      { id: "ch1", title: "Intro to Re-renders", completed: true },
      {
        id: "ch2",
        title: "Elements, Children as Props, and Re-renders",
        completed: true,
      },
      {
        id: "ch3",
        title: "Configuration Concerns with Elements as Props",
        completed: false,
      },
      {
        id: "ch4",
        title: "Advanced Configuration with Render Props",
        completed: false,
      },
      {
        id: "ch5",
        title: "Memoization with useMemo, useCallback, and React.memo",
        completed: false,
      },
      {
        id: "ch6",
        title: "Deep Dive into Diffing and Reconciliation",
        completed: false,
      },
      {
        id: "ch7",
        title: "Higher-Order Components in the Modern World",
        completed: false,
      },
      { id: "ch8", title: "React Context and Performance", completed: false },
      {
        id: "ch9",
        title: "Refs: From Storing Data to Imperative API",
        completed: false,
      },
      { id: "ch10", title: "Closures in React", completed: false },
      {
        id: "ch11",
        title: "Implementing Advanced Debouncing and Throttling with Refs",
        completed: false,
      },
      {
        id: "ch12",
        title: "Escaping Flickering UI with useLayoutEffect",
        completed: false,
      },
      {
        id: "ch13",
        title: "React Portals and Why We Need Them",
        completed: false,
      },
      {
        id: "ch14",
        title: "Data Fetching on the Client and Performance",
        completed: false,
      },
      {
        id: "ch15",
        title: "Data Fetching and Race Conditions",
        completed: false,
      },
      {
        id: "ch16",
        title: "Universal Error Handling in React",
        completed: false,
      },
    ],
  },
  {
    slug: "web-performance-fundamentals",
    name: "Web Performance Fundamentals",
    author: "Nadia Makarevich",
    cover: "/books/book_webperformance.webp",
    link: "https://www.getwebperf.com/",
    description:
      "A practical guide for frontend developers to understand, profile, and optimize React web applications. The book focuses on real-world performance issues—rendering, bundle size, data fetching, and interaction latency—using modern tools and techniques to build faster, more responsive apps.",
    isDone: false,
    chapters: [
      { id: "ch1", title: "Hello and Welcome!", completed: true },
      { id: "ch2", title: "Let's Talk About Performance", completed: true },
      {
        id: "ch3",
        title: "Intro to Initial Load Performance",
        completed: true,
      },
      {
        id: "ch4",
        title: "Client-side Rendering and Flame Graphs",
        completed: true,
      },
      { id: "ch5", title: "SPAs and Introducing INP", completed: true },
      {
        id: "ch6",
        title: "Intro to Rendering on the Server (SSR)",
        completed: false,
      },
      {
        id: "ch7",
        title: "Bundle Size and What to Do About It",
        completed: false,
      },
      {
        id: "ch8",
        title: "Intro to Lazy Loading and Suspense",
        completed: false,
      },
      { id: "ch9", title: "Advanced Lazy Loading", completed: false },
      {
        id: "ch10",
        title: "Data Fetching and React Server Components",
        completed: false,
      },
      { id: "ch11", title: "Interaction Performance", completed: false },
      { id: "ch12", title: "Re-renders Refresher", completed: false },
      { id: "ch13", title: "React Compiler", completed: false },
      { id: "ch14", title: "Final Thoughts", completed: false },
    ],
  },
  {
    slug: "cant-hurt-me",
    name: "Can't Hurt Me",
    author: "David Goggins",
    cover: "/books/book_cant_hurt_me.jpg",
    link: "https://www.amazon.in/Cant-Hurt-Me-Master-Your-ebook/dp/B07H453KGH",
    isDone: false,
    description:
      "U.S. Navy SEAL and high performance athlete David Goggins shares the secret to his achievements, which revolves around his mindset, work ethic, high standards, and ability to create a calloused mind.",
    chapters: [
      { id: "ch0", title: "Introduction", completed: true },
      { id: "ch1", title: "I Should Have Been a Statistic", completed: true },
      { id: "ch2", title: "Truth Hurts", completed: true },
      { id: "ch3", title: "The Impossible Task", completed: true },
      { id: "ch4", title: "Taking Souls", completed: false },
      { id: "ch5", title: "Armored Mind", completed: false },
      { id: "ch6", title: "It’s Not About a Trophy", completed: false },
      { id: "ch7", title: "The Most Powerful Weapon", completed: false },
      { id: "ch8", title: "Talent Not Required", completed: false },
      { id: "ch9", title: "Uncommon Amongst Uncommon", completed: false },
      { id: "ch10", title: "The Empowerment of Failure", completed: false },
      { id: "ch11", title: "What If?", completed: false },
    ],
  },
  {
    slug: "harry-potter-philosophers-stone",
    name: "Harry Potter and the Philosopher’s Stone",
    link: "https://www.amazon.in/Harry-Potter-Philosophers-Stone-Rowling/dp/1408855658",
    description:
      "Harry Potter and the Philosopher’s Stone follows an orphaned boy who discovers he is a wizard and enters the hidden world of magic through Hogwarts School. As Harry learns about friendship, courage, and his own past, he uncovers a dark secret tied to a powerful magical object and the wizard who killed his parents.",
    author: "J. K. Rowling",
    cover: "/books/hp_philosopher_stone.jpg",
    isDone: true,
    chapters: [
      { id: "ch1", title: "The Boy Who Lived", completed: true },
      { id: "ch2", title: "The Vanishing Glass", completed: true },
      { id: "ch3", title: "The Letters from No One", completed: true },
      { id: "ch4", title: "The Keeper of the Keys", completed: true },
      { id: "ch5", title: "Diagon Alley", completed: true },
      {
        id: "ch6",
        title: "The Journey from Platform Nine and Three-Quarters",
        completed: true,
      },
      { id: "ch7", title: "The Sorting Hat", completed: true },
      { id: "ch8", title: "The Potions Master", completed: true },
      { id: "ch9", title: "The Midnight Duel", completed: true },
      { id: "ch10", title: "Hallowe'en", completed: true },
      { id: "ch11", title: "Quidditch", completed: true },
      { id: "ch12", title: "The Mirror of Erised", completed: true },
      { id: "ch13", title: "Nicolas Flamel", completed: true },
      { id: "ch14", title: "Norbert the Norwegian Ridgeback", completed: true },
      { id: "ch15", title: "The Forbidden Forest", completed: true },
      { id: "ch16", title: "Through the Trapdoor", completed: true },
      { id: "ch17", title: "The Man with Two Faces", completed: true },
    ],
  },
  {
    slug: "harry-potter-chamber-of-secrets",
    name: "Harry Potter and the Chamber of Secrets",
    author: "J. K. Rowling",
    cover: "/books/hp_chamber_of_secrets.jpg",
    isDone: false,
    description:
      "In his second year at Hogwarts, Harry Potter uncovers a dark legend tied to a hidden chamber within the school.",
    link: "https://www.amazon.in/Harry-Potter-Chamber-Secrets/dp/1408855666/ref=pd_lpo_d_sccl_1/258-9032962-2083815?pd_rd_w=fDcCc&content-id=amzn1.sym.e0c8139c-1aa1-443c-af8a-145a0481f27c&pf_rd_p=e0c8139c-1aa1-443c-af8a-145a0481f27c&pf_rd_r=ZMB10223CXBX0SY0WRGN&pd_rd_wg=vvUBA&pd_rd_r=2b1101ee-c30d-4edd-9173-956e01607b24&pd_rd_i=1408855666&psc=1",
    chapters: [
      { id: "ch1", title: "The Worst Birthday", completed: true },
      { id: "ch2", title: "Dobby’s Warning", completed: true },
      { id: "ch3", title: "The Burrow", completed: true },
      { id: "ch4", title: "At Flourish and Blotts", completed: true },
      { id: "ch5", title: "The Whomping Willow", completed: true },
      { id: "ch6", title: "Gilderoy Lockhart", completed: false },
      { id: "ch7", title: "Mudbloods and Murmurs", completed: false },
      { id: "ch8", title: "The Deathday Party", completed: false },
      { id: "ch9", title: "The Writing on the Wall", completed: false },
      { id: "ch10", title: "The Rogue Bludger", completed: false },
      { id: "ch11", title: "The Dueling Club", completed: false },
      { id: "ch12", title: "The Polyjuice Potion", completed: false },
      { id: "ch13", title: "The Very Secret Diary", completed: false },
      { id: "ch14", title: "Cornelius Fudge", completed: false },
      { id: "ch15", title: "Aragog", completed: false },
      { id: "ch16", title: "The Chamber of Secrets", completed: false },
      { id: "ch17", title: "The Heir of Slytherin", completed: false },
      { id: "ch18", title: "Dobby’s Reward", completed: false },
    ],
  },
  {
    slug: "the-alchemist",
    name: "The Alchemist",
    author: "Paulo Coelho",
    link: "https://www.amazon.in/Alchemist-Paulo-Coelho/dp/8172234988",
    cover: "/books/book_alchemist.jpg",
    description:
      "The Alchemist follows a young shepherd named Santiago on a journey to discover his Personal Legend. Through travel, symbols, and self-discovery, the story explores purpose, faith, and the idea that listening to one’s heart is the key to fulfillment.",
    isDone: true,
    chapters: [
      { id: "ch1", title: "The Shepherd and His Dream", completed: true },
      { id: "ch2", title: "Meeting the King of Salem", completed: true },
      { id: "ch3", title: "Loss, Fear, and a New Beginning", completed: true },
      {
        id: "ch4",
        title: "Learning the Language of the World",
        completed: true,
      },
      { id: "ch5", title: "Love and the Soul of the World", completed: true },
      { id: "ch6", title: "The Alchemist", completed: true },
      { id: "ch7", title: "Following the Heart", completed: true },
      { id: "ch8", title: "The Treasure", completed: true },
    ],
  },
];
