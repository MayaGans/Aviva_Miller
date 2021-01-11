<script>
  export let testimonialData = {};
  const { HEADING, TESTIMONIAL_LIST } = testimonialData;
</script>
<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->

<section id="testimonials" class="section">
  <div class="container">
    <h2 class="title text-center">{HEADING}</h2>
    <div class="row section-body">
      {#each TESTIMONIAL_LIST as list}
        <div class="testimonial">
          <p>{list.DESCRIPTION}</p>
          <br>
          <p class="user-details">
            <b class="bigger">{list.NAME}</b>
            <br>
            {list.TITLE}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>
<!------------------------------------------->
<!----------------STYLE----------------------->
<!------------------------------------------->
<style>

  .section {
    background-color: #191919;
    font-size: 12px;
  }

  .bigger {
    font-size: 15px;
    color: #0189B6;
  }

  .testimonial {
    border-left: 4px solid #0189B6;
    margin-top: 10px;
    margin-bottom: 10px;
    background-color: #191919;
    color: #D0D0D0;
    margin: auto;
    padding-left: 20px;
    width: 60%;
  }

  h2 {
    color: #D0D0D0;
  }

  a:hover {
    text-decoration: none;
    color: #00AEEF;
  }

  a {
    color: black;
  }

  .testimonial img {
    height: 60px;
    width: 60px;
    border-radius: 50%;
    margin: 0 10px;
  }

  .user-details {
    display: inline-block;
    font-size: 12px;
  }
</style>