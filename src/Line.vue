<script>
import { Line, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ["options"],
  type: ["line"],
  watch: {
    chartData() {
      this.renderChart(this.chartData, this.options);
    },
    options() {
      this.renderChart(this.chartData, this.options);
    }
  }
};
</script>
