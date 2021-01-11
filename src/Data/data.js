const HEADER = "Aviva Miller";

const NAVBAR_DATA = [
  { id: 4, url: "#about-us", label: "About" },
  { id: 3, url: "#services", label: "Services" },
  { id: 5, url: "#testimonials", label: "Testimonials" },
  { id: 5, url: "#footer", label: "Contact" },
];

const BANNER_DATA = {
  HEADING: "Go digital with nixalar",
  DECRIPTION: "Board Certified Rheumatologist with local hospital privileges. Practicing in South Florida for over 20 years."
};

const SERVICE_DATA = {
  HEADING: "Non-Profit Executive, Consultant & Fundraiser",
  ALL_SERVICES: "All Services",
  SERVICE_LIST: [
    {
      URL: "images/gold_coast.jpg",
      SRC: "https://goldcoastarts.org/film10/",
    },
    {
      URL: "images/ccfp.jpg",
      SRC: "https://www.creativecommunityforpeace.com/"
    },
    {
      URL: "images/NYTF_logo.jpg",
      SRC: "https://nytf.org/"
    },
    {
      URL: "images/jafi.jpg",
      SRC: "https://www.jewishagency.org/"
    }
  ]
};

const RECIPE_DATA = {
  HEADING: "Non-Profit Consulting",
  ALL_SERVICES: "All Services",
  SERVICE_LIST: [
    {
      LABEL: "Tree of Life Synagogue",
      SRC: "https://www.treeoflifepgh.org/",
      IMG: "images/tols.png"
    },
    {
      LABEL: "American Society for Yad Vashem",
      SRC: "https://www.yadvashem.org/",
      VIDEO: ["images/Video1.mov", "images/Video2.mov"]
    },
    {
      LABEL: "Bnai Zion Medical Center",
      SRC: "https://www.b-zion.org.il/default_e.aspx",
      IMG: "images/bzmc.png"

    }
  ]
};

const ABOUT_DATA = {
  HEADING: "Aviva Miller",
  TITLE: "Why we're different",
  IMAGE_URL: "images/avivamiller.jpg",
  WHY_CHOOSE_US_LIST: [
    "We provides Cost-Effective Digital Marketing than Others.",
    "High customer statisfaction and experience.",
    "Marketing efficiency and quick time to value.",
    "Clear & transparent fee structure.",
    "We provides Marketing automation which is an integral platform that ties all of your digital marketing together.",
    "A strong desire to establish long lasting business partnerships.",
    "Provide digital marketing to mobile consumer.",
    "We provides wide range to services in reasonable prices"
  ]
};
const TESTIMONIAL_DATA = {
  HEADING: "Testimonials",
  TESTIMONIAL_LIST: [
    {
      DESCRIPTION:
        "You'll find in Aviva one of the most fearless door-openers and connectors. We met when we both worked on the Fundraising Team at The Jewish Agency for Israel. Aviva is based in NYC and appears to know or have a connection to everyone significant in NY and beyond. The same goes for the entertainment industry where she is deeply connected. She is an innovative event planner and thinks big. Her energy is contagious. She was always generous in sharing her contacts with me and believes in win-win partnerships.",
      IMAGE_URL: "images/user1.jpg",
      URL: "",
      NAME: "Michael Lawrence",
      TITLE: "Chief Development Officer of The Jewish Agency For Israel"

    }
  ]
};

const SOCIAL_DATA = {
  HEADING: "Find us on social media",
  IMAGES_LIST: [
    "images/front.png",
    "images/inside.png",
    "images/waitingroom.jpeg",
  ]
};

const FOOTER_DATA = {
  DESCRIPTION:
    "We are typically focused on result-based maketing in the digital world. Also, we evaluate your brand’s needs and develop a powerful strategy that maximizes profits.",
  CONTACT_DETAILS: {
    HEADING: "Contact us",
    ADDRESS: "La trobe street docklands, Melbourne",
    MOBILE: "+1 61234567890",
    EMAIL: "nixalar@gmail.com"
  },
  SUBSCRIBE_NEWSLETTER: "Subscribe newsletter",
  SUBSCRIBE: "Subscribe"
};

const MOCK_DATA = {
  HEADER,
  NAVBAR_DATA,
  BANNER_DATA,
  SERVICE_DATA,
  ABOUT_DATA,
  TESTIMONIAL_DATA,
  SOCIAL_DATA,
  FOOTER_DATA,
  RECIPE_DATA
};

export default MOCK_DATA;
