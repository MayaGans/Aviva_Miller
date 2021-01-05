<script>
  export let recipeData = {};
  const { HEADING, ALL_SERVICES, SERVICE_LIST } = recipeData;
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section id="recipes" class="section grey-bgcolor">
  <div class="container text-center">
    <h2>{HEADING}</h2>
      <div class="flex-container">
      {#each SERVICE_LIST as list}
        <div class="box">
          {list.LABEL}
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
    background-color:  #fffff7 !important;
    color:  #D0D0D0;
    font-weight: 100;
  }

  .col-centered{
    float: none;
    margin: 0 auto;
}

.flex-container {
  padding-top: 50px !important;
  display: flex;
  justify-content: space-between;
  padding: 0;
  margin: 0;
}

  .box {
    border: 3px solid white;
    border-radius: 5px;
    padding: 50px;
    margin: 5px;
    background-color: #daf4e6;
    filter: drop-shadow(0 0 0.2rem #D0D0D0);
    width: 30%;
    color: black;
  }

  @media (max-width: 674px) {
  .box {
    width: 100%;
  }
}

  a {
    margin-top: 20px;
    text-decoration: none;
    color: black;
    background-color: #00d4ff;
    padding: 10px;
  }

  a:hover {
    color: black;
    background-color: white;
    text-decoration: none;
  }
</style>