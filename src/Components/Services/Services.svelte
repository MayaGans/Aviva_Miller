<script>
  export let serviceData = {};
  const { HEADING, ALL_SERVICES, SERVICE_LIST } = serviceData;
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section id="services" class="section grey-bgcolor">
  <div class="container text-center">
    <h2>{HEADING}</h2>
    <div class="row section-body">
      {#each SERVICE_LIST as list}
        <div class="col-sm-3 service col-centered">
          <a href={list.SRC} target="_blank"><img src={list.URL} alt={list.LABEL} class="service-img" /></a>
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
    background-color:  #daf4e6 !important;
    color:  #D0D0D0;
    font-weight: 100;
  }

  .col-centered{
    float: none;
    margin: 0 auto;
}

  h3 {
    font-size: 1.5em;
  }

  .label {
    padding-top: 20px;
  }
  p {
    font-size: 0.8em !important;
  }

  col-md-3 {
    margin: 50px;
    word-wrap: break-word;
  }

  .service-img {
    width: 50%;
    margin-top: 20px;
    -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
    filter: grayscale(100%);
  }

  .service-img:hover {
    filter: drop-shadow(0 0 0.75rem grey);
  }

  .service h4 {
    padding: 5px;
    margin-top: 25px;
    text-transform: uppercase;
  }

  .title {
    color: #D0D0D0;
  }

  .title::before {
    content: "";
    background: linear-gradient(90deg, #0072ff 0%, #00d4ff 100%);
    height: 5px;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
    display: block;
    transform: translateY(60px);
  }

  .title::after {
    content: "";
    background: linear-gradient(90deg, #0072ff 0%, #00d4ff 100%);
    height: 10px;
    width: 50px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 40px;
    display: block;
    transform: translateY(14px);
  }

  section .btn-primary {
    box-shadow: none;
    padding: 8px 25px;
    border: none;
  }

</style>