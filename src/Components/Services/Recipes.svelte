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
      <div class="card">
        <div class="card-header">
          <span>{list.LABEL}</span>
        </div>
        <div class="card-body">
          {#if list.VIDEO }
          {#each list.VIDEO as video}
          <video class="videoInsert" controls="controls" name="Video Name" src={video} type="video/mp4"></video>
          {/each}
          <br>
          {:else}
            <img src={list.IMG}>
          {/if}
        </div>
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
    color: #D0D0D0;
    font-weight: 100;
  }

  .bottom {
    position: absolute;
    bottom: 0;
    margin: auto;
  }

  img {
    width: 100%;
  }

  video {
    width: 40%;
    padding: 5px;
    margin-top: 50px;
  }

  .card {
    margin: 5px;
    width: 30%;
    border: 1px solid #0189B6;
  }

  .card-header {
    background-color: #0189B6;
    min-height: 80px;
    color: white;
    font-size: 20px;
    display: inline-block;
  }

  span {
    display: inline-block;
    vertical-align: middle;
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


  @media (max-width: 900px) {
  .flex-container {
    display: block;
  }
  .card {
    width: 100%;
  }

  img {
    width: 50%;
    margin: auto;
  }

  a:hover { 
    transform: scale(0.5)
  }
}

a:hover {
  text-decoration: none;
  color: white;

}

a:hover { transform: scale(1.1); }

</style>