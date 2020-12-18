<template>
  <div class="small" style="position: relative; height:40vh; width:80vw">
    <button @click="getData()">Click for new data from AoC</button>
    <BarChart :chartData="datacollection" :options="chartOptions"></BarChart>
    <div class="text-center">
      <v-pagination
        v-model="pagination.day"
        :length="pagination.days"
      ></v-pagination>
      <BarChart :chartData="daily_data" :options="dailyChartOptions"></BarChart>
    </div>
  </div>
</template>
<script>
import BarChart from "./BarChart.vue";
import moment from "moment";

export default {
  name: "AoC",
  components: {
    BarChart
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      dailyChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true
            }
          ]
        }
      },
      pagination: {
        day: 1,
        days: 26
      },
      datacollection: {
        labels: ["overall_score"],
        datasets: [
          {
            label: "overall_score",
            data: [""]
          }
        ]
      },
      json: null,
      daily_data: {
        labels: ["daily_score"],
        datasets: [
          {
            label: "daily_score",
            data: [""]
          }
        ]
      }
    };
  },
  mounted() {
    //this.getData();
    this.json = JSON.parse(localStorage.getItem("leaderboard"));
    this.fillData();
  },
  watch: {
    pagination: {
      handler(updated_pagination) {
        this.fillDailyData(updated_pagination.day);
      },
      deep: true
    }
  },
  methods: {
    getData() {
      const headers = {
        credentials: "include",
        mode: "no-cors",
        Accept: "application/json"
      };

      fetch("api/2020/leaderboard/private/view/195249.json", headers)
        .then(response => response.json())
        .then(data =>
          localStorage.setItem("leaderboard", JSON.stringify(data["members"]))
        );
    },
    get_sorted(members, score, sort_order = "ascending") {
      var order = Array.from(Array(score.length).keys()).sort((a, b) =>
        score[a] < score[b] ? -1 : (score[b] < score[a]) | 0
      );
      if (sort_order == "descending") {
        order = order.reverse();
      }
      var sorted_members = order.map(index => members[index]);
      var sorted_score = order.map(index => score[index]);
      return [sorted_members, sorted_score, order];
    },
    fillData() {
      //first implement barplot for overall stars?
      var members = Object.entries(this.json).map(member => {
        return member[1]["name"];
      });
      var local_score = Object.entries(this.json).map(
        member => member[1]["local_score"]
      );
      var sorted = this.get_sorted(members, local_score, "descending");
      this.datacollection = {
        labels: sorted[0],
        datasets: [
          {
            label: "Overall score",
            data: sorted[1]
          }
        ]
      };
    },
    fillDailyData(day) {
      var start_date = moment(`2020-12-${day}T06:00:00`, "YYYY-MM-DDTHH:mm:ss");
      if (start_date.weekday() == 6 || start_date.weekday() == 0) {
        start_date.add(2, "hours");
      }
      //first implement barplot for overall stars?
      var members = Object.entries(this.json).map(member => member[1]["name"]);
      var part_1 = Object.entries(this.json).map(member => {
        var day_data = member[1]["completion_day_level"][day.toString()];
        if (day_data && day_data["1"]) {
          var ts = moment.unix(day_data["1"]["get_star_ts"]);
          var diff = ts.diff(start_date, "minutes");
          return diff;
        } else {
          return Infinity;
        }
      });
      var part_2 = Object.entries(this.json).map(member => {
        var day_data = member[1]["completion_day_level"][day.toString()];
        if (day_data && day_data["2"]) {
          var ts = moment.unix(day_data["2"]["get_star_ts"]);
          var diff = ts.diff(start_date, "minutes");
          return diff;
        } else {
          return Infinity;
        }
      });
      var sorted = this.get_sorted(members, part_2, "ascending");
      var order = sorted[2];
      var part1_ordered = order.map(index => part_1[index]);
      this.daily_data = {
        labels: sorted[0],
        datasets: [
          {
            label: "part1_minutes",
            data: part1_ordered,
            stack: "1",
            backgroundColor: "blue"
          },
          {
            label: "part2_minutes",
            data: sorted[1],
            stack: "2",
            backgroundColor: "green"
          }
        ]
      };
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
