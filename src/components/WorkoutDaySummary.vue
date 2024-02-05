<template>
  <div class="d-flex flex-column">
    <span>Duration: {{ duration }}</span>
  </div>
</template>

<script>
  export default {
    props: {
      exercisesMap: {
        type: Object,
        required: true
      },

      dayExerciseIds: {
        type: Array,
        required: true
      }
    },

    computed: {
      dayExercises() {
        return this.dayExerciseIds.map(x => this.exercisesMap[x]);
      },

      duration() {
        if (this.dayExercises.some(x => (x.durationMinutes ?? -1) == -1)) {
          return '???';
        }

        const exerciseGapMins = 1;
        const totalMins = this.dayExercises.sum(x => +x.durationMinutes) + (this.dayExercises.length * exerciseGapMins);

        if (totalMins < 60) {
          return `${totalMins} mins`;
        }
        else {
          const hours = Math.floor(totalMins / 60);
          return `${hours} hr${hours == 1 ? '' : 's'} ${totalMins % 60} mins`;
        }
      }
    }
  }
</script>