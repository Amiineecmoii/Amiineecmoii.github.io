export default {
  site: {
    title: "Amiineecmoii",
    subtitle: "breaking things",
    description: "breaking things a lot ...",
    keywords: "Amiineecmoii, CTF, reverse engineering, malware, pwn, crypto, cybersecurity",
    author: "Amiineecmoii",
    language: "en",
  },

  sidebar: {
    avatar: "/images/avatar1.webp",
    position: "right",
  },

  widgets: ["recent_posts", "category", "tag", "tagcloud"],

  menu: [
    { name: "home", url: "/" },
    { name: "archives", url: "/archives" },
    { name: "about", url: "/about" },
  ],

banner: "images/banner.webp",

banner_srcset: {
  enable: true,
  srcset: [
    { src: "images/banner-600w.webp", media: "(max-width: 479px)" },
    { src: "images/banner-800w.webp", media: "(max-width: 799px)" },
    { src: "images/banner.webp", media: "(min-width: 800px)" },
  ],
},


  footer: {
    since: 2026,
    powered: true,
    count: true,
    busuanzi: true,
    icp: {
      icpnumber: "",
      beian: "",
      recordcode: "",
    },
    moe_icp: {
      icpnumber: "",
    }
  },

  analytics: {
    baidu_analytics: false,
    google_analytics: false,
    clarity: false,
  },

  social: {
    github: "https://github.com/Amiineecmoii",
    instagram: "https://www.instagram.com/amiineecmoi?igsh=MW9xenRyb2t3OGczeA%3D%3D&utm_source=qr",
    twitter: "https://x.com/amineeecmoi",
    linkedin: "https://www.linkedin.com/in/aminee-eljabri-b21438328/",
  },

  valine: { enable: false },
  waline: { enable: false },
  gitalk: { enable: false },
  giscus: { enable: false },
  utterances: { enable: false, repo: "owner/repo", issue_term: "title", theme: "auto" },
  twikoo: { enable: false },
  disqus: { enable: false, shortname: "", count: true },

  friend: [
    {
      name: "Amiineecmoii",
      url: "https://amiineecmoii.github.io/",
      desc: "CTF player • Reverse engineer • Malware breaker",
      avatar: "/images/avatar.webp",
    },
  ],

  copyright: {
    enable: true,
    content: {
      author: true,
      link: true,
      title: true,
      date: false,
      updated: false,
      license: true,
      license_type: "by-nc-sa",
    },
  },

  preloader: {
    enable: true,
    text: "Breaking things...",
    rotate: true,
  },

  firework: {
    enable: true,
    disable_on_mobile: false,
    options: {
      excludeElements: ["a", "button"],
      particles: [
        {
          shape: "circle",
          move: ["emit"],
          easing: "easeOutExpo",
          colors: [
            "var(--red-1)",
            "var(--red-2)",
            "var(--red-3)",
            "var(--red-4)",
          ],
          number: 20,
          duration: [1200, 1800],
          shapeOptions: {
            radius: [16, 32],
            alpha: [0.3, 0.5],
          },
        },
        {
          shape: "circle",
          move: ["diffuse"],
          easing: "easeOutExpo",
          colors: ["var(--red-0)"],
          number: 1,
          duration: [1200, 1800],
          shapeOptions: {
            radius: 20,
            alpha: [0.2, 0.5],
            lineWidth: 6,
          },
        },
      ],
    },
  },

  home_categories: {
    enable: false,
    content: [],
  },

  triangle_badge: {
    enable: false,
    type: "github",
    link: "https://github.com/Amiineecmoii",
  },

  outdate: {
    enable: false,
    daysAgo: 180,
  },

  share: [
    "twitter",
    "facebook",
    "linkedin",
    "reddit",
    "qq",
    "weixin",
  ],

  sponsor: {
    enable: false,
    qr: [],
  },
};
