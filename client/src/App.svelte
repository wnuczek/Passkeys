<script lang="ts">
  import Support from "./lib/Support.svelte";
  import Register from "./lib/Register.svelte";
  import Login from "./lib/Login.svelte";
</script>

<main>
  <h1>Passkeys</h1>

  <div class="card">
    <Support />
  </div>

  <div class="card">
    <Register />
  </div>
  <div class="card">
    <Login />
  </div>
</main>

<style>
</style>
