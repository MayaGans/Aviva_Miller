<script>
  export let aboutData = {};
  const { HEADING, TITLE, IMAGE_URL, WHY_CHOOSE_US_LIST } = aboutData;
</script>
<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section id="about-us" class="section grey-bgcolor">
  <div class="container">
    <div class="section-body">

      <div style="text-align:center;display:inline;">
        <img src={IMAGE_URL} alt="" class="img-fluid" />
        <br>
        <h2>Aviva Miller</h2>
        <h4>Entertainment Attorney & Executive</h4>
      </div>

      <div style="display:inline;line-height:2;">
        <br/>
        <br/>
          Aviva Miller is an entertainment attorney with over 25 years of experience in film,
television, theatre, and live event production. She is currently utilizing her creative talent
in the development of several TV and Film projects in addition to consulting and
fundraising for non-profit organizations. In recent years, Aviva has worked as a top-level
executive building the brands of several new and iconic entertainment-related non-profit
institutions including Creative Community for Peace, Jewish Agency For Israel, National
Yiddish Theatre Folksbiene and the Gold Coast International Film Festival.  

Previously, Ms. Miller was Of Counsel to the law firm of Daniel, Siegel and Bimbler,
LLP, which concentrated its practice in all aspects of entertainment law.  Ms. Miller
acted as a legal advisor to filmmakers and film productions, television
producers, theatrical producers and Broadway productions, recording artists,
writers, concert promoters.  
<br><br>
Prior to her tenure at Daniel, Siegel and Bimbler, Ms. Miller headed creative
development for Moonglow Entertainment and served as Executive in Charge of
Production for two independently produced television series that aired on major
networks. 
<br><br>
At Radio City Music Hall Productions, Aviva was Senior Attorney of Business Affairs,
where she joined the production team to advise, negotiate and draft agreements for
major theatricals, including The Radio City Music Hall Christmas Spectacular, The
Rockettes,
Concert Series and other Special Events including the MTV Video Music Awards, The
Grammy Awards, Comic Relief, two Super Bowl Half-Time Shows and the World Cup
Soccer Closing Ceremony.
<br><br>
Ms. Miller began her legal career on Wall Street as an Associate in the Structured
Finance Group of Cadwalader, Wickersham & Taft.  She attended Cardozo School of
Law, is admitted to practice in New York, and is a member of the Bar of the Supreme
Court of the United States.  Ms. Miller has served on the boards of several non-profits 
and has been honored for her charitable work. Aviva speaks fluent Hebrew and
lived in Israel for 3+ years.
</div>
</section>

<!------------------------------------------->
<!----------------STYLE----------------------->
<!------------------------------------------->
<style>

  .about-title {
    margin-top: 8%;
    margin-bottom: 20px;
  }

  .section-body {
    padding: 20px 0;
    width: 80%;
    margin: auto;
   }

  .row {
    padding-bottom: 0;
  }

  .img-fluid {
    width: 20%;
    display:block;
    margin:auto;
    filter: drop-shadow(0 0 0.75rem black);
    border-radius: 50%;
  }

  .section {
    background-color: #fffff7 !important;
    color: black;
  }

  p {
    display: inline-block;
  }

  h1, h2, h3, h4 {
    color: black;
  }

  section ul li {
    margin: 10px 0;
  }

  section ul {
    padding-left: 23px;
  }
</style>