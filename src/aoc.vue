<template>
  <div class="small" style="position: relative; height:40vh; width:80vw">
    <div v-if="aoc_data">
      <v-switch
        v-model="showTime"
        :label="`Show time instead of score: ${showTime}`"
      ></v-switch>
      <LineChart
        :chartData="datacollection"
        :options="chartOptions"
      ></LineChart>
      <div class="text-center">
        <v-pagination
          v-model="pagination.day"
          :length="pagination.days"
        ></v-pagination>
        <v-switch
          v-model="logscaleBoolean"
          :label="`xAxes-scale: ${logscaleBoolean ? 'logarithmic' : 'linear'}`"
        ></v-switch>
        <BarChart
          :chartData="daily_data"
          :options="dailyChartOptions"
        ></BarChart>
      </div>
    </div>
  </div>
</template>
<script>
import BarChart from "./BarChart.vue";
import LineChart from "./Line.vue";
import moment from "moment";
import "chartjs-plugin-colorschemes";
import "chartjs-plugin-zoom";

export default {
  name: "AoC",
  components: {
    BarChart,
    LineChart
  },
  props: ["aoc_data"],
  computed: {
    dailyChartOptions: function() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true,
              type: this.logscaleBoolean ? "logarithmic" : "linear"
            }
          ]
        },
        plugins: {
          colorschemes: {
            scheme: "tableau.Tableau10"
          }
        }
      };
    },
    chartOptions: function() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        spanGaps: 1,
        scales: {
          yAxes: [
            {
              type: this.showTime ? "logarithmic" : "linear"
            }
          ]
        },
        plugins: {
          colorschemes: {
            scheme: "tableau.Tableau10"
          },
          zoom: {
            pan: { enabled: true },
            zoom: { enabled: true }
          }
        }
      };
    }
  },
  data() {
    return {
      showTime: false,
      logscaleBoolean: true,
      pagination: {
        day: this.get_current_day(),
        days: 25
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
  async mounted() {
    console.log(this.aoc_data);
    this.fillData();
    this.fillDailyData(this.pagination.day);
  },
  watch: {
    pagination: {
      handler(updated_pagination) {
        this.fillDailyData(updated_pagination.day);
      },
      deep: true
    },
    showTime: {
      handler(showTime) {
        this.fillData(showTime);
      }
    }
  },
  methods: {
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
    get_current_day() {
      var day = 1;
      var current_date = moment();
      var end_date = moment(`2020-12-25T06:00:00`, "YYYY-MM-DDTHH:mm:ss");
      if (current_date.diff(end_date) > 0) {
        day = 25;
      } else {
        day = current_date.date();
      }
      return day;
    },
    fillData(showTime) {
      var overall_data = this.getOverallData();
      console.log(overall_data);
      //first implement barplot for overall stars?
      var members = Object.entries(this.aoc_data["members"]).map(member => {
        return member[1]["name"];
      });
      var local_score = Object.entries(this.aoc_data["members"]).map(member => {
        return member[1]["local_score"];
      });
      var sorted = this.get_sorted(members, local_score, "descending");
      members = sorted[0];
      var datasets = [];
      var labels = [];
      for (let day = 1; day <= this.get_current_day(); ++day) {
        labels.push("day" + day.toString() + "_part1");
        labels.push("day" + day.toString() + "_part2");
      }
      for (let member of members) {
        console.log(member);
        var data = [];
        var rank_data = overall_data[member]["rank"];
        var time_data = overall_data[member]["time"];
        var points = 0;
        var time = 0;
        for (let day = 1; day <= this.get_current_day(); ++day) {
          var x_val = { 1: day, 2: day + 0.5 };
          for (let part of [1, 2]) {
            if (time_data[part][day - 1] != Infinity && day != 1) {
              points += members.length + 1 - rank_data[part][day - 1];
              time += time_data[part][day - 1];
            }
            if (showTime == true) {
              if (time_data[part][day - 1] != Infinity && day != 1) {
                data.push({ x: x_val[part], y: Math.round(time / 60) });
              } else {
                data.push({ x: x_val[part], y: null });
              }
            } else {
              data.push({ x: x_val[part], y: points });
            }
          }
        }

        console.log(data);
        datasets.push({
          label: member,
          data: data,
          fill: false,
          spanGaps: false,
          showLine: false
        });
      }
      console.log("HERE");
      console.log(datasets);
      this.datacollection = {
        labels: labels,
        datasets: datasets
      };
      console.log(datasets);
    },
    getDailyTimes(day) {
      var start_date = moment(`2020-12-${day}T06:00:00`, "YYYY-MM-DDTHH:mm:ss");
      if (start_date.weekday() == 6 || start_date.weekday() == 0) {
        start_date.add(2, "hours");
      }
      var part_1 = Object.entries(this.aoc_data["members"]).map(member => {
        var day_data = member[1]["completion_day_level"][day.toString()];
        if (day_data && day_data["1"]) {
          var ts = moment.unix(day_data["1"]["get_star_ts"]);
          var diff = ts.diff(start_date, "seconds");
          return diff;
        } else {
          return Infinity;
        }
      });
      var part_2 = Object.entries(this.aoc_data["members"]).map(member => {
        var day_data = member[1]["completion_day_level"][day.toString()];
        if (day_data && day_data["2"]) {
          var ts = moment.unix(day_data["2"]["get_star_ts"]);
          var diff = ts.diff(start_date, "seconds");
          return diff;
        } else {
          return Infinity;
        }
      });

      return [part_1, part_2];
    },
    getOverallData() {
      var members = Object.entries(this.aoc_data["members"]).map(
        member => member[1]["name"]
      );

      var member_data = {};
      for (var name of members) {
        member_data[name] = { time: { 1: [], 2: [] }, rank: { 1: [], 2: [] } };
      }
      console.log(member_data);
      for (let i = 1; i <= this.get_current_day(); ++i) {
        var parts = this.getDailyTimes(i);
        for (let j in parts[0]) {
          console.log(member_data[members[j]]);
          member_data[members[j]]["time"]["1"].push(parts[0][j]);
          member_data[members[j]]["time"]["2"].push(parts[1][j]);
        }
        var sorted_part1 = this.get_sorted(members, parts[0], "ascending");
        var sorted_part2 = this.get_sorted(members, parts[1], "ascending");
        for (let j = 0; j < parts[0].length; ++j) {
          member_data[sorted_part1[0][j]]["rank"]["1"].push(j + 1);
          member_data[sorted_part2[0][j]]["rank"]["2"].push(j + 1);
        }

        // calculate day1 and day2 time per player

        // calculate day1 and day2 rank per player
      }
      return member_data;
    },
    fillDailyData(day) {
      //first implement barplot for overall stars?
      var members = Object.entries(this.aoc_data["members"]).map(
        member => member[1]["name"]
      );
      var parts = this.getDailyTimes(day);
      var sorted = this.get_sorted(members, parts[1], "ascending");
      var order = sorted[2];
      var part1_ordered = order.map(index => parts[0][index]);
      var part1_data = part1_ordered.map(time => Math.round(time / 60));
      var part2_data = sorted[1].map(time => Math.round(time / 60));
      this.daily_data = {
        labels: sorted[0],
        datasets: [
          {
            label: "part1_minutes",
            data: part1_data,
            stack: "1",
            backgroundColor: "blue"
          },
          {
            label: "part2_minutes",
            data: part2_data,
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
