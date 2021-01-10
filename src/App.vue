<template>
  <v-app>
    <v-main>
      <div v-if="aoc_data">
        <AoC :aoc_data="aoc_data" />
      </div>
    </v-main>
  </v-app>
</template>

<script>
import AoC from "./aoc";

export default {
  name: "App",

  components: {
    AoC
  },
  async created() {
    this.aoc_data = await fetch(`195249.json`)
      .then(response => response.json())
      .then(data => data);
    console.log(this.aoc_data);
  },

  data: () => ({
    aoc_data: null
  })
};
</script>
