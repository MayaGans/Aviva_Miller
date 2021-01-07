<script>
import { listen } from "svelte/internal";

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
        <a class="box" href={list.SRC} target="_blank">
        <div>
          {list.LABEL}
        </div>
        </a>
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
    border: 3px solid gray;
    border-radius: 5px;
    padding: 50px;
    margin: 5px;
    background-color: #191919;
    filter: drop-shadow(0 0 0.2rem #D0D0D0);
    width: 30%;
    color: #D0D0D0;
  }


  @media (max-width: 674px) {
  .flex-container {
    display: block;
  }
  .box {
    width: 100%;
  }
}

a:hover {
  text-decoration: none;
  color: white;

}

a:hover { transform: scale(1.1); }

</style>