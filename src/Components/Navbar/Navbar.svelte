<script>
  export let navlists = [];
  export let header;
  console.log(navlists);
</script>
<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section id="nav-bar">
  <nav class="navbar navbar-expand-md navbar-dark">
      <span style="font-size:25px;"><strong>aviva miller</strong></span>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation">
      <span class="navbar-toggler-icon" />
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ml-auto">
        {#each navlists as list}
          <li class="nav-item">
            <a class="nav-link light-color" href={list.url}>{list.label}</a>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
</section>
<!------------------------------------------->
<!----------------STYLE----------------------->
<!------------------------------------------->
<style>
  #nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #daf4e6 !important;  
    min-height: 100px !important;
    font-size: 20px;
  }

  a.nav-link.light-color {
    color: #999 !important;
  }

  section#nav-bar {
    padding: 20px !important;
    font-weight: 300 !important;
}

  .navbar {
    padding: 0 20px !important;
  }

  .navbar-brand {
    color: #1F2E4B !important;
  }

  .navbar-nav li {
    padding: 0 0 0 20px;
    font-weight: 300 !important;
  }

  .navbar-nav li a {
    text-transform: lowercase;
    float: right;
    text-align: left;
    font-weight: 300 !important;
  }

  .navbar-nav a:hover {
    color: black !important;
  }

  a:hover {
    font-weight: 400 !important;
  }

  .navbar-brand, .navbar-nav li.nav-item a.nav-link {
    height: inherit;
    line-height: 30px !important;
    padding-top: 7px !important;
    padding-bottom: 5px !important;
}

a.nav-link,
a.nav-link:after,
a.nav-link:before {
  transition: all .5s;
}

a.nav-link {
  position: relative;
}

a.nav-link:after {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 0%;
  content: '.'; /* make invisible, dot beneath links */
  color: transparent;
  background: black;
  height: 2px;
}

a.nav-link:hover:after {
  width: 70%;
}
</style>