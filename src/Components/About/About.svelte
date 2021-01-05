<script>
  export let aboutData = {};
  const { HEADING, TITLE, IMAGE_URL, WHY_CHOOSE_US_LIST } = aboutData;
</script>
<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section id="about-us" class="section grey-bgcolor">
  <div class="container">
    <div class="row section-body">
      <div class="col-md-6" style="text-align:center;">
        <img src={IMAGE_URL} alt="" class="img-fluid" />
        <br>
        <h2>Aviva Miller</h2>
        <h4>Entertainment Attorney & Executive</h4>
      </div>
      <div class="col-md-6">
        <br/>
        <br/>
        <p>
          Under this I will explain and fill in with parts of my bio
        </p>
      </div>
    </div>
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

  .img-fluid {
    width: 50%;
    display:block;
    margin:auto;
    filter: drop-shadow(0 0 0.75rem black);
    border-radius: 50%;
  }

  .section {
    background-color: #fffff7 !important;
    color: black;
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