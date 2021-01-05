<script>
  import Navbar from "./Components/Navbar/Navbar.svelte";
  import Banner from "./Components/Banner/Banner.svelte";
  import Services from "./Components/Services/Services.svelte";
  import Recipes from "./Components/Services/Recipes.svelte";
  import About from "./Components/About/About.svelte";
  import Testimonials from "./Components/Testimonials/Testimonials.svelte";
  import Social from "./Components/Social/Social.svelte";
  import Footer from "./Components/Footer/Footer.svelte";
  import DATA from "./Data/data";
</script>

<Navbar navlists={DATA.NAVBAR_DATA} header={DATA.HEADER} />
<About aboutData={DATA.ABOUT_DATA} />
<Services serviceData={DATA.SERVICE_DATA} />
<Recipes recipeData={DATA.RECIPE_DATA} />
<!-- <Social socialData={DATA.SOCIAL_DATA} /> -->
<Testimonials testimonialData={DATA.TESTIMONIAL_DATA} />
<Footer footerData={DATA.FOOTER_DATA} header={DATA.HEADER} />
